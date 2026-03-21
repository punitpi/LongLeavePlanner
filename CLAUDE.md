# Long Leave Planner

Next.js 14 (App Router, TypeScript, Tailwind). All work on `feature/nextjs-rebuild`; `backup/main` is a read-only snapshot.

## Commands
- `npx vitest run` — run tests (Vitest, not Jest)
- `npx tsc --noEmit` — type-check without building
- `npm run dev` — local dev server

## Date formats
- Algorithm input/internal keys: `DD-MM-YYYY`
- API responses and calendar `dateString` fields: `YYYY-MM-DD`
- Never use `date.toISOString()` for local dates — it converts to UTC first and gives the wrong day in UTC+ timezones (IST, CET). Use `date.getFullYear()` / `getMonth()` / `getDate()` instead.

## Key files
- `lib/algorithm.ts` — core cluster algorithm; exports `formatDateString` (DD-MM-YYYY) and `getHolidayWeekends`
- `lib/staticHolidays.ts` — static holiday data for countries missing from Nager.Date (India, UAE, etc.)
- `lib/clientCache.ts` — browser-side TTL cache for country/holiday API responses
- `lib/sessions.ts` — localStorage session management (max 10 sessions)
- `app/api/calculate/route.ts` — server-side result cache (module-level Map, max 500 entries)

## Testing
- Assert specific date values and `needToApply` per day — not just aggregates (`length > 0`, `some(...)`)
- Test `getHolidayWeekends` directly for weekend edge cases (Sat/Sun holidays need separate tests from weekday holidays)

## Gotchas
- `formatDateString` is exported from `lib/algorithm.ts` — import it rather than redefining
- Nager.Date API returns `name` (English) and `localName` (local language) — always prefer `name`
- Server-side Next.js fetch cache: countries revalidate every 7 days, holidays every 1 day
