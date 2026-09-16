# BuildNova

An AI-powered infrastructure and construction management platform with three
role-based workspaces — **Engineer**, **Manager**, and **Supervisor** —
connected through one shared system, plus an embedded assistant,
**BuildNova AI**, powered by Google Gemini.

Built with Next.js (App Router) so the whole app — frontend, REST API, and
AI integration — deploys to Vercel as a single project.

## What's included

- Landing page, role-based login, and protected dashboards for all three roles
- Project planning, blueprint & planning notes, task breakdown, supervisor
  assignment, resource allocation, resource requests (approve/reject/modify),
  progress updates, site photo uploads, and completion reporting
- Notifications, reports/analytics with charts, and light/dark mode
- **BuildNova AI**: a chat assistant scoped to each user's own authorized
  project data, refusing anything outside BuildNova's domain
- A REST API (`/api/...`) backing all of the above, with role-based
  authorization on every route
- Realistic seed data so the app is fully usable the moment it's deployed

## Current data layer — read this first

BuildNova currently runs on an **in-memory demo database**
(`lib/data.ts`) rather than a real one, per the brief's own instruction to
ship with working demo data now and wire up persistent storage later. That
means:

- Data resets whenever the server restarts, redeploys, or a serverless
  instance goes cold — this is expected, not a bug.
- To connect a real database, replace the functions in `lib/data.ts` with
  calls to your DB client (Vercel Postgres, Supabase, Neon, etc.). Every
  other file imports data only through those functions, so the rest of the
  app doesn't need to change.

Auth is similarly a lightweight signed-cookie session (see `lib/session.ts`
and `lib/auth.ts`) with plaintext demo passwords in the seed data — fine for
a demo, not for production. Swap in NextAuth.js, Clerk, or similar, and
hash passwords, before this handles anyone's real data.

## Local setup

```bash
npm install
cp .env.example .env.local
# then edit .env.local and add your GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000.

### Demo accounts

All demo accounts use the password `password123`.

| Role       | Email                        |
|------------|-------------------------------|
| Engineer   | engineer@buildnova.dev        |
| Manager    | manager@buildnova.dev         |
| Supervisor | marcus@buildnova.dev (or priya@, tom@, grace@buildnova.dev) |

The login page has a "Try a demo account" shortcut that fills these in.

## Deploying to Vercel

1. Push this project to a GitHub (or GitLab/Bitbucket) repository.
   `.gitignore` already excludes `.env.local`, `node_modules`, and build
   output — never commit your real API key.
2. In Vercel, **Add New → Project**, and import that repository. Vercel
   detects Next.js automatically; no build settings to change.
3. Before the first deploy (or right after, then redeploy), add these under
   **Project Settings → Environment Variables** for Production, Preview, and
   Development:
   - `GEMINI_API_KEY` — your Google Gemini API key
     ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))
   - `SESSION_SECRET` — any long random string (`openssl rand -base64 32`)
   - `GEMINI_MODEL` — optional, defaults to `gemini-flash-latest`
4. Deploy. That's it — the same in-memory demo data seeds itself on the
   deployed instance too.

## Project structure

```
app/
  page.tsx                 Landing page
  login/page.tsx            Role-based login
  (app)/[role]/            Protected dashboards — shared routes,
                            content branches by role (engineer/manager/
                            supervisor) at request time
  api/                      REST endpoints (auth, projects, tasks,
                            resources, resource-requests, progress,
                            photos, notifications, ai/chat)
components/                 UI components (shared, charts/, project/)
lib/
  data.ts                   In-memory demo database + all data access
  auth.ts, session.ts       Signed-cookie session handling
  ai.ts                     BuildNova AI (Gemini) integration
  types.ts                  Shared TypeScript types
middleware.ts                Route protection for /engineer, /manager,
                              /supervisor
```

## Security notes

- `GEMINI_API_KEY` is read server-side only (`process.env.GEMINI_API_KEY` in
  `lib/ai.ts`) and is never sent to the browser.
- If a real API key was ever pasted into a chat, doc, or commit, treat it as
  compromised and rotate it — generate a new one and update your env vars.
- Site photos are stored as base64 data URLs in the demo database. For real
  usage, upload to a storage provider (Vercel Blob, S3, Cloudinary) and
  store the resulting URL instead — data URLs don't scale.
