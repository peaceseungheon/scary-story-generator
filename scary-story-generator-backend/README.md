# Scary Story Generator Backend

Simple Express + TypeScript backend that accepts a list of keywords and uses a Gemini-compatible text + image generation API to produce:

- 한 편의 무서운 이야기 (텍스트)
- 대표 이미지 (이미지 URL 또는 저장된 파일 경로)

Endpoints
- POST /generate
  - body: { keywords: string[] }
  - response: { story: string, imageUrl: string | null }

Environment variables (Google Cloud Gemini)
- GOOGLE_API_KEY - (optional) simple API key. If set, requests will use ?key=... query param.
- GOOGLE_GEMINI_BEARER - (optional) an OAuth2 access token (Authorization: Bearer ...). If set, it will be used instead of API key.
- GOOGLE_TEXT_MODEL - (optional) text model id, default: models/text-bison-001
- GOOGLE_IMAGE_MODEL - (optional) image model id, default: models/image-bison-001
- GOOGLE_IMAGE_SIZE - (optional) image size, default: 1024x1024
- PORT - optional

Notes on auth
- You can either supply `GOOGLE_API_KEY` for simple usage (not all projects allow this), or set `GOOGLE_GEMINI_BEARER` to a valid OAuth2 access token. To obtain an access token for a service account you can run (locally) `gcloud auth application-default print-access-token` or use a short-lived token fetched via a service account flow. For production servers, use Workload Identity / service account credentials and refresh tokens securely.

How it works
- Server composes a prompt from provided keywords and calls the text endpoint.
- It then calls the image endpoint with a concise prompt (first keyword + mood hints).
- If image API returns base64, server saves it to `public/images` and returns `/public/images/<file>` URL.

Run (dev)

Install deps and run in the `scary-story-generator-backend` directory:

```bash
npm install
npm run dev
```

Notes
- This code expects Gemini-compatible endpoints — the exact request/response shape may differ for the provider. Set appropriate URLs and API key.
- If you want, I can adapt the client to a specific provider (OpenAI, Google Cloud Gemini API) once you tell me which exact endpoint/credentials you plan to use.
