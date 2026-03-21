---
name: wrap-session
description: End-of-session checklist for Long Leave Planner — simplify, security, tests, CLAUDE.md, commit
---

You are wrapping up a development session on the Long Leave Planner project. Run each phase in order and report results before moving to the next. Stop and surface any blocking issues immediately.

## Phase 1: Verify the build is clean

Run these in parallel:
- `npx tsc --noEmit` — type check
- `npm test` — all 40 tests must pass
- `npm run lint` — no ESLint errors

If any fail, stop and fix before continuing.

## Phase 2: Simplify changed code

Use the `/simplify` skill on all files changed since the last commit (`git diff HEAD --name-only`).

Look for:
- Duplicate logic (especially date formatters — `formatDateString` is the canonical one in `lib/algorithm.ts`)
- Unnecessary wrappers or thin functions
- What-comments that restate the code rather than explain the why
- Redundant array copies or Set constructions

## Phase 3: Security check

Use the `feature-dev:code-reviewer` agent to review changed API routes and middleware for:
- Input validation gaps
- Rate limiting correctness (never trust `x-forwarded-for` as primary IP)
- Information disclosure in error responses
- Country code allowlisting before proxying to Nager.Date

Focus only on `app/api/`, `middleware.ts`, `lib/validation.ts`.

## Phase 4: Update CLAUDE.md

Use `/claude-md-management:revise-claude-md` to capture any new learnings from this session:
- New gotchas discovered
- Date format rules that tripped things up
- Algorithm invariants
- Commands that proved useful

## Phase 5: Commit

If there are uncommitted changes after all fixes, create a clean commit using `/commit`.

---

## Project-specific reminders
- Date formats: algorithm = `DD-MM-YYYY`, API/calendar = `YYYY-MM-DD`
- Never use `toISOString()` — use `getFullYear/getMonth/getDate` for local dates
- `formatDateString` is exported from `lib/algorithm.ts` — don't redefine it
- `needToApply` must be `false` for any day in the `bankHolidays` input set
- Rate limiter key: use `request.ip` first, not `x-forwarded-for`
