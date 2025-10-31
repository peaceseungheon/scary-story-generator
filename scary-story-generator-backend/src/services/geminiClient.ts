type ImageResult =
  | { type: 'url'; url: string }
  | { type: 'base64'; base64: string };

const fetchFn = (globalThis as any).fetch as typeof fetch;

function getGoogleAuthHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // Prefer bearer token if provided
  const bearer = process.env.GOOGLE_GEMINI_BEARER;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  // If no bearer, we'll attach key as query param (handled by caller)
  return headers;
}

/**
 * Generate text using Google Cloud Generative AI (Gemini) REST API.
 *
 * Supported auth methods:
 * - Set GOOGLE_GEMINI_BEARER to an OAuth2 access token (Authorization: Bearer ...)
 * - Or set GOOGLE_API_KEY and the key will be appended as ?key=...
 *
 * Environment variables:
 * - GOOGLE_TEXT_MODEL (optional, default: models/text-bison-001)
 */
export async function generateStoryWithGemini(prompt: string): Promise<string> {
  const model = process.env.GOOGLE_TEXT_MODEL || 'models/text-bison-001';
  const base = `https://generativelanguage.googleapis.com/v1/${model}:generate`;
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = apiKey ? `${base}?key=${apiKey}` : base;

  const headers = getGoogleAuthHeaders();

  const body = {
    prompt: {
      text: prompt,
    },
    temperature: 0.45,
    maxOutputTokens: Number(process.env.GOOGLE_MAX_OUTPUT_TOKENS || 800),
  } as any;

  const resp = await fetchFn(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Text generation failed: ${resp.status} ${t}`);
  }

  const data = await resp.json();

  // Google Gen AI common shapes: data.candidates[0].content or data.output[0].content
  if (Array.isArray(data?.candidates) && typeof data.candidates[0]?.content === 'string') {
    return data.candidates[0].content;
  }
  if (Array.isArray(data?.output) && typeof data.output[0]?.content === 'string') {
    return data.output[0].content;
  }
  if (typeof data?.text === 'string') return data.text;

  return JSON.stringify(data);
}

/**
 * Generate image using Google Cloud Images API.
 * Env:
 * - GOOGLE_IMAGE_MODEL (optional, default: models/image-bison-001)
 * - GOOGLE_API_KEY or GOOGLE_GEMINI_BEARER
 */
export async function generateImageWithGemini(prompt: string): Promise<ImageResult> {
  const model = process.env.GOOGLE_IMAGE_MODEL || 'models/image-bison-001';
  const base = `https://generativelanguage.googleapis.com/v1/images:generate`;
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = apiKey ? `${base}?key=${apiKey}` : base;

  const headers = getGoogleAuthHeaders();

  const body = {
    model,
    prompt,
    // size could be "1024x1024"
    size: process.env.GOOGLE_IMAGE_SIZE || '1024x1024',
  } as any;

  const resp = await fetchFn(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Image generation failed: ${resp.status} ${t}`);
  }

  const data = await resp.json();

  // possible shapes: data?.artifacts?.[0]?.image or data?.data?.[0]?.b64 or data?.images
  if (Array.isArray(data?.data) && typeof data.data[0]?.b64_json === 'string') {
    return { type: 'base64', base64: data.data[0].b64_json };
  }
  if (Array.isArray(data?.artifacts) && typeof data.artifacts[0]?.base64 === 'string') {
    return { type: 'base64', base64: data.artifacts[0].base64 };
  }
  if (Array.isArray(data?.images) && typeof data.images[0] === 'string') {
    const first = data.images[0];
    if (first.startsWith('http')) return { type: 'url', url: first };
    return { type: 'base64', base64: first };
  }

  // common field names
  if (typeof data?.imageUrl === 'string') return { type: 'url', url: data.imageUrl };
  if (typeof data?.image_url === 'string') return { type: 'url', url: data.image_url };
  if (typeof data?.b64_json === 'string') return { type: 'base64', base64: data.b64_json };

  throw new Error('Unknown image response format from provider');
}
