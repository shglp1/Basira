# Baseera V1 MVP (Execution PRD aligned)

## What is implemented
- Supabase Auth integration surfaces (signup/login/logout).
- Supabase-aligned schema with `profiles` linked to `auth.users` and RLS policies.
- Real assessment flow:
  - start assessment record
  - fetch questions from DB
  - autosave responses using UPSERT `(assessment_id, item_id)`
  - capture `response_time_ms`
  - submit + server-side scoring/matching
- Real results page from persisted `scores.profile_json` + `matches` (no hardcoded jobs).
- Low confidence warning in report.
- Minimal admin guard by role (`profiles.role = 'admin'`).

## Setup
1. Copy `.env.example` to `.env.local` and set Supabase values.
2. Apply `db/schema.sql` in Supabase SQL editor.
3. Insert at least one published assessment version + items + occupations.

## Commands
```bash
npm ci
npm run test
npm run dev
```

## Notes
- This repo includes `.npmrc` to enforce public npm registry for deterministic installs.
- In locked-down environments where registry access is denied, installation may still fail due to external policy.


## CI / lockfile gate
- Merge gate requires: `npm ci && npm run test && npm run build`.
- If your CI blocks npmjs.org, set `NPM_REGISTRY_URL` to an internal registry mirror/allowlisted registry.
- Generate lockfile from an allowed environment with:

```bash
./scripts/generate-lockfile.sh
git add package-lock.json
```
