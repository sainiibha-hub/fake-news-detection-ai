# AGENTS.md — FakeScope Architecture Guide

This document provides an overview of the project structure for developers and AI agents working on this codebase.

## Project Overview

FakeScope is a fake news and misinformation detection tool powered by AI. Users paste news articles, headlines, or social media posts, and the app returns a structured credibility analysis including a FAKE/REAL/UNCERTAIN verdict, confidence score, red flags, and positive indicators.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| AI | Anthropic Claude via Netlify AI Gateway |
| Language | TypeScript 5 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
src/
  routes/
    __root.tsx        # Root HTML shell with metadata
    index.tsx         # / — Full UI (input, results, history sidebar)
    api.analyze.ts    # POST /api/analyze — server-side AI analysis handler
  styles.css          # Global Tailwind styles
public/               # Static assets
```

## Key Architecture Decisions

### AI via Server Route (not Netlify Function)
Analysis is handled by `src/routes/api.analyze.ts` using TanStack Start's `server.handlers` pattern. This keeps server logic co-located with the route. The handler is SSR-only — no AI code is shipped to the client bundle.

### Anthropic SDK via Netlify AI Gateway
`new Anthropic()` is instantiated with no arguments. Netlify AI Gateway automatically injects `ANTHROPIC_API_KEY` and `ANTHROPIC_BASE_URL` at runtime — no secrets need to be managed manually. Only models listed in the AI Gateway skill docs are used.

### Structured JSON Output
The Claude prompt instructs the model to return ONLY valid JSON matching a specific schema. The server uses a regex to extract the JSON block and parses it before forwarding to the client.

### No Persistent Storage
Analysis history is maintained in React state on the client (last 8 items). If history persistence is required in the future, use Netlify Database (`@netlify/database` with Drizzle ORM).

## Coding Conventions

- All AI calls must happen server-side only (never expose keys to the client)
- Use Tailwind utility classes only; no CSS modules
- TanStack Start routes use `createFileRoute` from `@tanstack/react-router`
- Server-only logic lives inside `server.handlers` blocks in route files
- Model: `claude-haiku-4-5` — fast and cost-effective for classification

## File-Based Routing

- `__root.tsx` — root layout wrapping all pages
- `index.tsx` — route for `/`
- `api.analyze.ts` — server POST handler at `/api/analyze`

## Environment Variables

No manual setup needed. Netlify AI Gateway injects:
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_BASE_URL`

These are available in any server-side context on Netlify.
