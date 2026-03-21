# Long Leave Planner

Find extended leave opportunities by strategically placing a few days off around public holidays. The app identifies clusters of holidays and weekends, then highlights which days you need to apply for leave to get a long break.

## How it works

1. Select your country and year — the app auto-loads public holidays
2. Or manually pick dates / upload a CSV
3. Click "Find Long Leaves" to see all leave opportunities visualized on a calendar

## Tech Stack

- **Frontend & Backend:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS with custom design system
- **Holiday Data:** [Nager.Date](https://date.nager.at/) (free, no API key required)

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

Push to your GitHub repo and connect to [Vercel](https://vercel.com). It auto-detects Next.js — zero configuration needed.

## Deploy with Docker

```bash
docker build -t long-leave-planner .
docker run -p 3000:3000 long-leave-planner
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Cloudflare Workers

The API routes use standard fetch and no Node.js-specific APIs, making them compatible with the Edge runtime. Add `export const runtime = 'edge'` to each API route file for Cloudflare Workers deployment. Note: the in-memory rate limiter in `middleware.ts` is stateless per request in edge environments — for production, replace with a persistent store like Cloudflare KV.

## CSV Upload Format

Upload a CSV file with a `date` column using `DD-MM-YYYY` format:

```
date
25-12-2025
01-01-2025
26-01-2025
```

Download the [template CSV](/template.csv) from the app.

## Development

```bash
npm run test        # Run tests
npm run lint        # Lint
npm run build       # Production build
```
