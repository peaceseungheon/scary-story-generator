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
- CORS_ALLOWED_ORIGINS - (optional) comma-separated list of allowed origins for CORS (default: '\*')
- CORS_ALLOWED_METHODS - (optional) comma-separated list of allowed methods (default: 'GET,HEAD,PUT,PATCH,POST,DELETE')
- CORS_ALLOWED_HEADERS - (optional) comma-separated list of allowed headers (default: 'Content-Type,Authorization')
- Note: The default text model was changed to default to a Claude Sonnet 4 identifier (env override via `GOOGLE_TEXT_MODEL` still works). Set `GOOGLE_TEXT_MODEL` to the provider-specific model id if needed.

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

## Single-file deployment and running

This repository has been consolidated into a single entrypoint (`src/index.ts`) so you can manage the entire backend as one file.

You can run it locally (development) or build a container yourself if you prefer. For simple local execution:

```bash
cd scary-story-generator-backend
npm install
npm run dev    # development with ts-node-dev
```

For production on a host that runs Node.js:

```bash
npm install --production
npm run build
PORT=8080 npm start
```

Environment variables (same as earlier in this README):

- GOOGLE_API_KEY or GOOGLE_GEMINI_BEARER
- GOOGLE_TEXT_MODEL (optional override for text model id)
- CLAUDE_DEFAULT_MODEL (optional, defaults to 'claude-sonnet-4')
- GOOGLE_IMAGE_MODEL
- GOOGLE_IMAGE_SIZE
- CORS_ALLOWED_ORIGINS
- CORS_ALLOWED_METHODS
- CORS_ALLOWED_HEADERS

If you later want a container, I can add a minimal Dockerfile again — for now the project is managed as a single file for simplicity.
