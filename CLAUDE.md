# Long Leave Planner

Next.js 14 (App Router, TypeScript, Tailwind). All work on `feature/nextjs-rebuild`; `backup/main` is a read-only snapshot.

## Commands
- `npm test` — run tests (Vitest, not Jest); or `npx vitest run`
- `npx tsc --noEmit` — type-check without building
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint via next lint

## Date formats
- Algorithm input/internal keys: `DD-MM-YYYY`
- API responses and calendar `dateString` fields: `YYYY-MM-DD`
- Never use `date.toISOString()` for local dates — it converts to UTC first and gives the wrong day in UTC+ timezones (IST, CET). Use `date.getFullYear()` / `getMonth()` / `getDate()` instead.

## Architecture
- `app/(main)/page.tsx` — planner (input) page; posts to `/api/calculate` on submit
- `app/(main)/results/page.tsx` — results page; reads sessions from localStorage
- `app/api/` — three routes: `countries`, `holidays` (Nager.Date proxy), `calculate`
- `lib/algorithm.ts` — pure calculation; no I/O
- `components/planner/` — year/country/holiday input components
- `components/results/` — calendar, opportunity cards, session switcher
- `components/ui/` — shared Button, Card, Toggle, GlassPanel primitives

## Key files
- `lib/algorithm.ts` — core cluster algorithm; exports `formatDateString` (DD-MM-YYYY) and `getHolidayWeekends`
- `lib/staticHolidays.ts` — static holiday data for countries missing from Nager.Date (India, UAE, etc.)
- `lib/clientCache.ts` — browser-side TTL cache for country/holiday API responses
- `lib/sessions.ts` — localStorage session management (max 10 sessions)
- `app/api/calculate/route.ts` — server-side result cache (module-level Map, max 500 entries)

## Testing
- Assert specific date values and `needToApply` per day — not just aggregates (`length > 0`, `some(...)`)
- Test `getHolidayWeekends` directly for weekend edge cases (Sat/Sun holidays need separate tests from weekday holidays)

## Branding
- "Long Leave Planner" describes what the app does (plan long leaves), it is NOT the product/brand name
- Do NOT use "longleaveplanner.com" — there is no such domain, it does not exist
- For any footer, watermark, or marketing text: use `window.location.origin` (the actual running URL) — never hardcode a domain
- The app has no official product name — refer to it descriptively if needed

## Workflow
- Do NOT commit changes during a session unless the user explicitly asks — they will commit when ready

## Gotchas
- `formatDateString` is exported from `lib/algorithm.ts` — import it rather than redefining
- Nager.Date API returns `name` (English) and `localName` (local language) — always prefer `name`
- Server-side Next.js fetch cache: countries revalidate every 7 days, holidays every 1 day
