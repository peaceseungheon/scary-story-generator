import express from "express";
import path from "path";
import cors from "cors";

// Use global fetch when available (Node 18+ or polyfilled)
const fetchFn = globalThis.fetch;

// Helper: simple sleep
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Helper: run an async operation with retries and exponential backoff
async function withRetries(fn, { retries = 2, baseDelay = 500 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }
  throw lastErr;
}

function getGoogleAuthHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  const bearer = process.env.GOOGLE_GEMINI_BEARER;
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  return headers;
}

async function generateStoryWithGemini(prompt) {
  // Try to use the official @google/genai SDK when available. If it's not
  // installed or fails, fall back to the existing REST fetch-based call.
  const hasAuth = Boolean(
    process.env.GOOGLE_GEMINI_BEARER ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY
  );

  if (!fetchFn || !hasAuth) {
    return `깊은 밤, ${
      prompt.split("키워드:")[1] ?? "어떤 존재"
    }의 속삭임이 들려왔다. 바람 소리 사이로 불확실한 그림자가 움직였고, 주인공은 한 걸음도 떼지 못했다. 문득 멈춘 시계 소리와 함께 과거의 기억들이 흘러나왔다. 방 안에는 누군가가 남긴 낡은 사진 한 장이 놓여 있었고, 그 사진 속 눈빛이 점점 선명해졌다.`;
  }

  // Build a friendly, conversational final prompt: ask the model to tell the
  // story as if speaking to a friend (썰 푸는 느낌), keeping the requested
  // atmosphere and length. Use this `finalPrompt` for SDK and REST calls.
  const finalPrompt = `${prompt}\n\n다음 지침을 따라 한국어로 썰 푸는 듯한 말투(친구에게 들려주는 느낌, 구어체)로 자연스럽고 몰입감 있게 이야기해주세요. 분위기는 음산하고 긴장감 있게 유지하세요. 글자수는 약 600~900자 내외로 작성하고, 키워드들을 자연스럽게 포함하세요.`;

  // Prefer SDK (streaming) when available
  // Prefer SDK (streaming) when available — wrap with retries/timeouts.
  try {
    return await withRetries(
      async (attempt) => {
        // dynamic import so deployment doesn't require the package unless used
        const genai = await import("@google/genai");
        const GoogleGenAI =
          genai.GoogleGenAI || genai.default?.GoogleGenAI || genai.default;
        if (!GoogleGenAI) throw new Error("GoogleGenAI not found in SDK");

        const ai = new GoogleGenAI({
          apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
        });

        const sdkModel =
          process.env.GOOGLE_SDK_MODEL ||
          process.env.GOOGLE_TEXT_MODEL ||
          "gemini-flash-latest";
        const config = { thinkingConfig: { thinkingBudget: -1 } };
        const contents = [{ role: "user", parts: [{ text: finalPrompt }] }];

        // If a single attempt should time out, we use a simple Promise.race with a timeout.
        const streamPromise = (async () => {
          const response = await ai.models.generateContentStream({
            model: sdkModel,
            config,
            contents,
          });
          let out = "";
          for await (const chunk of response) {
            if (chunk?.text) out += chunk.text;
          }
          return out;
        })();

        const timeoutMs = Number(process.env.GENAI_SDK_TIMEOUT_MS || 15_000);
        const result = await Promise.race([
          streamPromise,
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error("SDK stream timeout")), timeoutMs)
          ),
        ]);

        if (result) return result;
        throw new Error("Empty SDK response");
      },
      { retries: Number(process.env.GENAI_SDK_RETRIES || 2), baseDelay: 500 }
    );
  } catch (err) {
    // SDK either not installed or failed after retries — fall back to REST below.
    // console.debug('genai sdk not used:', err?.message || err);
    console.error("SDK story generation failed:", err?.message || err);
  }

  // REST fallback (compatible with older generative language endpoints)
  try {
    const model = process.env.GOOGLE_TEXT_MODEL || "models/text-bison-001";
    const base = `https://generativelanguage.googleapis.com/v1/${model}:generate`;
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = apiKey ? `${base}?key=${apiKey}` : base;

    const headers = getGoogleAuthHeaders();

    const body = {
      prompt: { text: finalPrompt },
      temperature: 0.45,
      maxOutputTokens: Number(process.env.GOOGLE_MAX_OUTPUT_TOKENS || 800),
    };

    const resp = await fetchFn(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`Text generation failed: ${resp.status} ${t}`);
    }

    const data = await resp.json();

    if (
      Array.isArray(data?.candidates) &&
      typeof data.candidates[0]?.content === "string"
    ) {
      return data.candidates[0].content;
    }
    if (
      Array.isArray(data?.output) &&
      typeof data.output[0]?.content === "string"
    ) {
      return data.output[0].content;
    }
    if (typeof data?.text === "string") return data.text;

    return JSON.stringify(data);
  } catch (err) {
    console.error("REST story generation failed:", err?.message || err);
    throw err;
  }
}

async function generateImageWithGemini(prompt) {
  const hasAuth = Boolean(
    process.env.GOOGLE_GEMINI_BEARER ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_API_KEY
  );
  if (!fetchFn || !hasAuth) {
    return {
      type: "url",
      url: "https://via.placeholder.com/1024x1024.png?text=Scary+Image",
    };
  }

  // Try SDK first (streaming image + text) with retries/timeouts. Fall back to REST.
  try {
    const sdkResult = await withRetries(
      async (attempt) => {
        const genai = await import("@google/genai");
        const GoogleGenAI =
          genai.GoogleGenAI || genai.default?.GoogleGenAI || genai.default;
        if (!GoogleGenAI) throw new Error("GoogleGenAI not found in SDK");

        const ai = new GoogleGenAI({
          apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
        });
        const sdkModel =
          process.env.GOOGLE_SDK_IMAGE_MODEL ||
          process.env.GOOGLE_IMAGE_MODEL ||
          "gemini-2.5-flash-image";
        const config = {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            imageSize:
              process.env.GOOGLE_IMAGE_SIZE === "1024x1024"
                ? "1K"
                : process.env.GOOGLE_IMAGE_SIZE || "1K",
          },
        };
        const contents = [{ role: "user", parts: [{ text: prompt }] }];

        const streamPromise = (async () => {
          const stream = await ai.models.generateContentStream({
            model: sdkModel,
            config,
            contents,
          });

          let lastText = "";

          for await (const chunk of stream) {
            const candidate = chunk?.candidates?.[0]?.content;
            if (candidate?.parts && Array.isArray(candidate.parts)) {
              for (const part of candidate.parts) {
                if (part?.inlineData?.data) {
                  return { type: "base64", base64: part.inlineData.data };
                }
                if (part?.text) lastText += part.text;
              }
            }
            if (chunk?.text) lastText += chunk.text;
          }
          if (lastText) return { type: "text", text: lastText };
          throw new Error("Empty SDK image/text stream");
        })();

        const timeoutMs = Number(process.env.GENAI_SDK_TIMEOUT_MS || 20_000);
        const res = await Promise.race([
          streamPromise,
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error("SDK stream timeout")), timeoutMs)
          ),
        ]);
        return res;
      },
      { retries: Number(process.env.GENAI_SDK_RETRIES || 2), baseDelay: 500 }
    );

    // If SDK returned base64 or text, map to ImageResult
    if (sdkResult) {
      if (sdkResult.type === "base64")
        return { type: "base64", base64: sdkResult.base64 };
      if (sdkResult.type === "text")
        return {
          type: "url",
          url: `data:text/plain;base64,${Buffer.from(sdkResult.text).toString(
            "base64"
          )}`,
        };
    }
  } catch (err) {
    console.error("SDK image generation failed:", err?.message || err);
    // ignore and fall back to REST
  }
}

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

app.use(express.json({ limit: "2mb" }));

// CORS configuration
const rawAllowed = (process.env.CORS_ALLOWED_ORIGINS ?? "*").trim();
// strip wrapping quotes if present
const allowedOriginsEnv = rawAllowed.replace(/^['"]|['"]$/g, "");
const allowedMethodsEnv =
  process.env.CORS_ALLOWED_METHODS ?? "GET,HEAD,PUT,PATCH,POST,DELETE";
const allowedHeadersEnv =
  process.env.CORS_ALLOWED_HEADERS ?? "Content-Type,Authorization";

let corsOptions;
if (allowedOriginsEnv === "*" || allowedOriginsEnv === "") {
  // allow all origins
  corsOptions = {
    origin: true,
    methods: allowedMethodsEnv.split(",").map((s) => s.trim()),
    allowedHeaders: allowedHeadersEnv.split(",").map((s) => s.trim()),
  };
} else {
  const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  corsOptions = {
    origin: (origin, callback) => {
      // allow requests with no origin (curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: allowedMethodsEnv.split(",").map((s) => s.trim()),
    allowedHeaders: allowedHeadersEnv.split(",").map((s) => s.trim()),
  };
}

// log effective CORS config for debugging
console.log("CORS settings:", {
  allowedOriginsEnv,
  allowedMethodsEnv,
  allowedHeadersEnv,
});

app.use(cors(corsOptions));
// enable preflight for all routes
app.options("*", cors(corsOptions));

/**
 * Single-file generate endpoint compatible with frontend expectations.
 * Accepts either:
 * - { keywords: string[] }
 * - { keyword: string } where keyword is comma-separated
 */
app.post("/api/generate", async (req, res) => {
  try {
    const body = req.body ?? {};

    let keywords = [];
    if (Array.isArray(body.keywords)) {
      keywords = body.keywords
        .map((k) => (typeof k === "string" ? k.trim() : ""))
        .filter(Boolean);
    } else if (typeof body.keyword === "string") {
      keywords = body.keyword
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    console.log("Received keywords:", keywords);

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        error: "keywords must be provided (array or comma-separated string)",
      });
    }

    const sanitized = keywords.slice(0, 10);

    const storyPrompt = `다음 키워드들을 사용해 한국어로 무서운 단편 소설을 작성해 주세요. 제목이 있어야 하며, 글자수는 약 500~800자 내외로, 분위기는 음산하고 긴장감 있고 아주 오싹해야 합니다. 이야기에 짜임새가 있어야 합니다. 키워드들을 자연스럽게 포함하세요. 키워드: ${sanitized.join(
      ", "
    )}`;

    const story = await generateStoryWithGemini(storyPrompt);

    const imagePrompt = `Based on the ${story}, generate an image following the instructions below. 
                          Descriptive (Composition + Atmosphere)
                          Express the climax of the story and its most unsettling scene through a single, powerful image. 
                          The spatial setting of the image is Korea. 
                          Position the focal subject (the protagonist or a single ominous object) in the foreground with shallow depth of field. 
                          Place threatening elements (shadow-like figures / broken mirrors / abandoned carriages / bloodstained letters) at a slight angle. 
                          Use a cold, low-saturation palette with deep navy shadows and subtle crimson accents. 
                          Employ dramatic cinematic lighting (low-key, rim light, diffuse fog/haze) with high detail in facial expressions and textures (wet hair, frayed fabric, weathered wood, cracked glass). Add subtle atmospheric particles (dust, mist) and directional beams piercing the darkness to heighten tension. 
                          Photorealistic rendering; never use text or watermarks.`;

    const imageResult = await generateImageWithGemini(imagePrompt);

    // do NOT persist image to disk — return a data URL for the frontend to display directly
    let imageUrl = null;
    if (imageResult.type === "url") {
      imageUrl = imageResult.url;
    } else if (imageResult.type === "base64") {
      imageUrl = `data:image/png;base64,${imageResult.base64}`;
    }

    const title = sanitized[0] + "에 관한 이야기";

    return res.json({ success: true, title, content: story, imageUrl });
  } catch (err) {
    console.error("generate error", err);
    return res
      .status(500)
      .json({ success: false, error: err?.message || "internal error" });
  }
});

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    info: "Scary Story Generator Backend (single-file mode)",
  });
});

/**
 * GET /health
 * 서버 상태 확인용 헬스 체크 엔드포인트
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// If this file is run directly (node index.js / container start), start the server.
// If it's imported by a serverless framework (e.g. Functions Framework) or tests,
// don't call `listen()` here — export the `app` instead.
const isMain =
  (typeof require !== "undefined" && require.main === module) ||
  (typeof import.meta !== "undefined" && import.meta.main === true);

if (isMain) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Scary story backend listening on http://localhost:${PORT}`);
  });
}

// Export the Express app and a Functions Framework-compatible handler.
export default app;
export const helloHttp = (req, res) => app(req, res);
