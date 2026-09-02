# Yakwork

Find open-source issues worth your first pull request — matched to your
GitHub profile, or just tell us what languages/topics you like.

## Project structure

```
yakwork/
├── apps/
│   ├── web/     Next.js frontend (TypeScript, Tailwind, App Router)
│   └── api/     FastAPI backend (async, Postgres, Redis, Celery)
├── infra/
│   └── docker-compose.yml
├── .github/workflows/ci.yml
└── docs/
```

## What's working right now (v0 scaffold)

- ✅ FastAPI backend boots, `/api/v1/health` responds, `/docs` shows interactive API docs
- ✅ `/api/v1/recommendations` endpoint + scoring logic (queries `cached_issues` table — empty until the indexer job runs at least once)
- ✅ `/api/v1/github/exchange-code` OAuth token-exchange endpoint (needs real GitHub OAuth App credentials to test end-to-end)
- ✅ Next.js frontend: landing page → dashboard with a preference form → calls the backend → renders issue cards
- ✅ Docker Compose wiring for Postgres, Redis, API, and Web
- ✅ GitHub Actions CI (lint + test both apps)
- ✅ DB models defined (`User`, `UserPreference`, `CachedRepo`, `CachedIssue`, `SavedIssue`) — **migrations not yet generated**
- ✅ Celery task skeleton for the background "issue indexer" job — **not yet wired to actually run on a schedule locally**

## Verified working (tested for real, not just "looks right")

This scaffold was tested against a real local Postgres instance, with a real
Alembic migration applied, and a real indexer run against GitHub's live API
(unauthenticated). Confirmed:

- `alembic revision --autogenerate` correctly detects all 5 models and
  generates a working migration; `alembic upgrade head` creates real tables
- The indexer pulled **50 real "good first issue" listings from live GitHub
  repos** into Postgres
- `POST /api/v1/recommendations` returned real scored, ranked results from
  that data over HTTP

**Bug found and fixed during this test run:** GitHub returns timestamps as
ISO strings (e.g. `"2026-08-30T16:16:02Z"`), but the DB column expects a
real `datetime` object — `_refresh_issues_for_language` now converts it
explicitly. Worth knowing about if you extend the indexer to pull more
fields from GitHub's API later — anything date-like needs the same treatment.

**Known real limitation, not yet solved:** the indexer's per-repo detail
fetch (star count, topics, CONTRIBUTING.md check) burns through GitHub's
**unauthenticated rate limit (60 requests/hour) very fast** — one indexing
run across ~20 repos was enough to hit it. The code has a fallback (defaults
to `stars=0` instead of crashing), but that means results will look wrong,
not just fail loudly. **This is not a sandbox artifact — it'll happen in
production too** unless you get `GITHUB_INDEXER_TOKEN` set (raises the limit
to 5,000/hour) before you index anything beyond a handful of repos.

## What's NOT done yet (your next steps)

1. **Set `GITHUB_INDEXER_TOKEN`** in `apps/api/.env` (a GitHub PAT with no
   special scopes needed for public data) — do this before running the
   indexer again, or you'll hit the same rate limit
2. **Create a GitHub OAuth App** (https://github.com/settings/developers) and fill in `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` in `apps/api/.env`
3. **Wire up NextAuth.js (or similar)** on the frontend for the "Sign in with GitHub" button — the backend endpoint is ready, but nothing calls it yet
4. **Run Celery worker + beat** so the indexer job actually runs hourly instead of only manually
5. Consider batching the per-repo detail fetch (star count etc.) — right now it's one API call per new repo per indexing run, which is what triggers the rate limit issue above

## Running locally (without Docker, fastest for development)

### Backend
```bash
cd apps/api
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# You'll need a local Postgres running, or use Docker just for that:
#   docker run -d -p 5432:5432 -e POSTGRES_USER=yakwork -e POSTGRES_PASSWORD=yakwork -e POSTGRES_DB=yakwork postgres:16-alpine
alembic upgrade head   # once migrations exist
uvicorn app.main:app --reload
```
Visit http://localhost:8000/docs to explore the API.

### Frontend
```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```
Visit http://localhost:3000

## Running everything with Docker Compose

```bash
cd infra
docker compose up --build
```

## Tech stack

See `docs/ARCHITECTURE.md` (or the original planning doc) for the full
rationale. Short version: Next.js + FastAPI + Postgres + Redis + Celery,
deployed on Vercel (web) + Railway/Render (api) + Neon/Supabase (db).
