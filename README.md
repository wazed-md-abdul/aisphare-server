# EduSphere AI — Server

Express + TypeScript backend for the EduSphere AI College Management System. Owns authentication, the MongoDB data layer, and **all AI processing** — the browser never talks to a model provider directly.

Live: **https://edushpareserver.vercel.app** · Frontend: [`../client`](../client)

## Tech Stack

- **Express 4** + TypeScript (ESM, `tsx` in dev)
- **MongoDB Atlas** via Mongoose
- **Better Auth** — email/password + Google OAuth, session cookies
- **OpenRouter** — LLM gateway (default model: `google/gemma-4-31b`, free multimodal; override with `OPENROUTER_MODEL`)
- **pdf-parse / mammoth** — server-side PDF & DOCX text extraction

## How the AI Is Implemented

All AI flows through one service layer: [`src/services/ai/openrouter.service.ts`](src/services/ai/openrouter.service.ts). Design decisions:

### 1. One gateway, per-feature prompt templates

Every feature has a dedicated prompt builder in [`src/services/ai/prompts/`](src/services/ai/prompts/):

| Prompt file | Feature | Output shape |
|---|---|---|
| `content.prompt.ts` | Lecture notes / quiz / study-material generation | Streamed markdown |
| `chat.prompt.ts` | Campus assistant system prompt (injects student name, college, course context, uploaded notes) | Streamed tokens |
| `analysis.prompt.ts` | Grades CSV analytics | Strict JSON |
| `classification.prompt.ts` | Document category + tags | Strict JSON |
| `document.prompt.ts` | PDF summarization + image analysis | Strict JSON / text |
| `recommend.prompt.ts` | Course advising from a student profile | Text (advisor persona) |

The service exposes typed methods (`generateContent`, `chat`, `analyzeCSV`, `classifyDocument`, `summarizePDF`, `analyzeImage`, `recommendCourse`) — controllers never build prompts or touch the HTTP API themselves.

### 2. Two transport modes

- **Streaming (SSE)** — long-form generation (`/api/ai/generate-content`, `/api/ai/chat`). The service consumes OpenRouter's `stream: true` chunked response, re-emits each delta token as `data: {"token": "..."}` Server-Sent Events, and the client renders tokens as they arrive. The full text is still accumulated server-side and persisted after the stream ends.
- **Request/response with JSON mode** — structured features (CSV analysis, summarization, classification) set `response_format: { type: "json_object" }` and run the reply through a **resilient `extractJson` parser**: direct parse → fenced-code-block extraction → regex fallbacks that salvage tags/summaries from loosely formatted output. Model hiccups degrade gracefully instead of 500ing.

### 3. Multimodal vision

`/api/ai/image` sends `image_url` content parts (base64 data URI) to the multimodal model — used for diagram/slide/handwriting analysis.

### 4. Server-side document extraction

Uploads arrive as base64. [`extract.service.ts`](src/services/extract.service.ts) picks the extractor by extension: `pdf-parse` (PDF), `mammoth` (DOCX), UTF-8 decode (TXT/MD). Only the extracted text goes to the model — never raw binaries.

### 5. Everything authenticated, everything persisted

- All `/api/ai/*` routes sit behind [`requireAuth`](src/middlewares/auth.middleware.ts) — validates the Better Auth session cookie and attaches `userId`, else 401.
- Every AI artifact is stored per-user in MongoDB: `GeneratedContent`, `Conversation` (full chat history), `AnalysisReport`, `Document` (summary + tags), `Recommendation`.
- The API key lives only in server env — clients never see it.

## API Surface

```
ALL  /api/auth/*                    Better Auth (sign-up, sign-in, session, Google OAuth)
GET  /health

# Courses
GET    /api/courses                 List catalog
GET    /api/courses/:id             Course details
POST   /api/courses                 Create (auth)
DELETE /api/courses/:id             Delete (auth)

# AI (all require session)
POST  /api/ai/generate-content      SSE stream — notes/quiz/study material
POST  /api/ai/chat                  SSE stream — context-aware assistant
POST  /api/ai/analyze               JSON — grades CSV analytics
POST  /api/ai/summarize             JSON — PDF/DOCX summary, flashcards, quiz, dates
PATCH /api/ai/documents/:id/tags    Update document tags
POST  /api/ai/image                 Multimodal image analysis
POST  /api/ai/recommend             Course recommendation from profile
GET   /api/ai/recommend/history     Past recommendations
```

## Project Structure

```
src/
  index.ts               Express bootstrap, CORS, Better Auth mount, Mongo connect + seed
  auth/                  Better Auth server instance
  middlewares/           requireAuth session guard
  routes/                ai.routes.ts, course.routes.ts
  controllers/           Thin controllers — SSE plumbing + persistence only
  services/
    ai/openrouter.service.ts   All model calls (complete / stream / vision / extractJson)
    ai/prompts/                One prompt template per feature
    extract.service.ts         PDF/DOCX/TXT text extraction
  models/                Mongoose schemas + seed catalog (15 courses, auto-upserted)
```

## Getting Started

```bash
npm install
cp .env.example .env    # fill in values below
npm run dev             # http://localhost:4000
```

### Environment Variables

| Var | Required | Notes |
|---|---|---|
| `PORT` | no | Default `4000` |
| `MONGODB_URI` | yes | Atlas `mongodb+srv://` URI (db `edusphere`) |
| `BETTER_AUTH_SECRET` | yes | Session signing secret |
| `CLIENT_URL` | prod | CORS origin (default `http://localhost:3000`) |
| `OPENROUTER_API_KEY` | yes | OpenRouter key |
| `OPENROUTER_MODEL` | no | Default `google/gemma-4-31b` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for OAuth | Google sign-in |

Note: `src/index.ts` forces DNS to `8.8.8.8`/`1.1.1.1` — some routers' DNS breaks the `mongodb+srv` SRV lookup on Windows.

### Scripts

| Command | |
|---|---|
| `npm run dev` | `tsx watch` dev server |
| `npm run build` / `npm start` | Compile + run |
| `npm run typecheck` | TypeScript check |

## Deployment (Vercel)

Deployed as its own Vercel project (`vercel.json` included; `app.listen` is skipped in the serverless environment and the Express instance is exported). The client proxies all `/api/*` calls here via rewrite — see [`../client/README.md`](../client/README.md) for the cross-domain cookie rationale.
