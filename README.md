# FakeScope — AI Fake News Detector

FakeScope is a web application that uses AI to analyze news articles, headlines, and social media posts for signs of misinformation, propaganda, and fake news.

## Key Technologies

- **Framework:** [TanStack Start](https://tanstack.com/start) (React, file-based routing)
- **AI:** Anthropic Claude via [Netlify AI Gateway](https://docs.netlify.com/build/ai-gateway/overview/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Deployment:** [Netlify](https://netlify.com)

## Features

- Paste any article text and receive a structured credibility analysis
- Verdict: **FAKE**, **REAL**, or **UNCERTAIN** with confidence score
- Credibility score meter, red flags, and positive indicators
- Session-based analysis history (last 8 analyses)
- Example articles to demo the tool

## How to Run Locally

```bash
npm install
netlify dev
```

The app runs on `http://localhost:8888`. Netlify AI Gateway environment variables are injected automatically in the Netlify dev environment — no API key setup required.

## Project Structure

```
src/
  routes/
    index.tsx        # Main UI — article input, results display, history
    api.analyze.ts   # POST /api/analyze — AI analysis endpoint
  styles.css         # Global Tailwind styles
```
