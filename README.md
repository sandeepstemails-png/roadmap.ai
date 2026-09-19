# Roadmap AI

A learning roadmap platform: learners follow visual, node-based roadmaps and
track their progress; admins create and manage roadmaps.

## Stack

- **Frontend/backend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Database:** Drizzle ORM over SQLite locally, [Turso](https://turso.tech) (libSQL) in production
- **Auth:** [Auth.js](https://authjs.dev) v5 (Credentials provider, JWT sessions)
- **Roadmap graph:** [@xyflow/react](https://reactflow.dev)
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in AUTH_SECRET (see below)
npm run db:generate                # generate SQL migrations from src/db/schema.ts
npm run db:migrate                 # apply migrations (creates local.db)
npm run db:seed                    # seed an admin + learner account and a sample roadmap
npm run dev
```

Generate an `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Seeded accounts (from `npm run db:seed`):

| Role    | Email                 | Password     |
| ------- | ---------------------- | ------------ |
| Admin   | admin@example.com      | Admin123!    |
| Learner | learner@example.com    | Learner123!  |

## Database: local vs. Turso

By default (no `TURSO_DATABASE_URL` set), the app and `drizzle-kit` use a
local SQLite file (`local.db`). To point at a Turso database instead, set in
`.env.local`:

```
TURSO_DATABASE_URL=libsql://<your-db>.turso.io
TURSO_AUTH_TOKEN=<your-token>
```

## Scripts

| Script              | Purpose                                    |
| -------------------- | ------------------------------------------- |
| `npm run dev`         | Start the dev server                        |
| `npm run build`       | Production build                            |
| `npm run start`       | Run the production build                    |
| `npm run lint`        | ESLint                                      |
| `npm run test`        | Unit tests (Vitest)                         |
| `npm run test:e2e`    | End-to-end tests (Playwright)               |
| `npm run db:generate` | Generate a migration from the schema        |
| `npm run db:migrate`  | Apply migrations                            |
| `npm run db:studio`   | Open Drizzle Studio                         |
| `npm run db:seed`     | Seed sample data                            |

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR: lint, typecheck, unit
tests, build, and a full Playwright E2E suite against a seeded local
SQLite database.

`.github/workflows/deploy.yml` deploys to Vercel and is **manual-trigger
only** (`workflow_dispatch`) — merging to `main`/`master` never auto-deploys.
Run it from the Actions tab and choose `preview` or `production`. It needs
these repository secrets:

- `VERCEL_TOKEN` — from [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` — from the Vercel project's Settings → General

In the Vercel project itself, set `AUTH_SECRET`, `TURSO_DATABASE_URL`, and
`TURSO_AUTH_TOKEN` as environment variables (Vercel needs no other
configuration — it builds and serves Next.js natively).
