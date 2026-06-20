# LMS Core — Frontend

Next.js client for LMS Core. Student dashboard, course catalog, enrollments, quizzes, certificates, and an admin panel. Talks to the [API server](../server/README.md) over REST with cookie-based auth.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+
- API server running (default: `http://localhost:5000`)

## Quick start (local)

```bash
cd client
pnpm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the API server first (see [server README](../server/README.md)), seed admin + courses, then:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

| Route | Description |
|-------|-------------|
| `/login` | Student login |
| `/register` | Student registration |
| `/admin/login` | Admin login |
| `/dashboard` | Student home |
| `/courses` | Course catalog |
| `/admin` | Admin dashboard |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run ESLint |

## Environment variables

Create `.env.local` (not committed to git):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL **without** `/api/v1`, e.g. `http://localhost:5000` |

The client appends `/api/v1` in `lib/api.ts`. Do not include the path suffix in the env var.

### Production example

```env
NEXT_PUBLIC_API_URL=https://lms-core-backend.onrender.com
```

On the **API server**, set `CLIENT_URL` to your frontend URL, e.g. `https://lms-core-frontend.onrender.com`.

## Architecture

- **App Router** (`app/`) with route groups: `(auth)`, `(protected)`
- **Client-side data fetching** via `lib/api.ts` (`fetch` + `credentials: "include"`)
- **Auth state** in `lib/auth-context.tsx` — calls `/auth/me` on protected routes
- **UI**: Tailwind CSS 4, shadcn/ui components

Protected pages show a loading spinner until auth completes, then fetch page data in `useEffect`.

## Deploy on Render

| Setting | Value |
|---------|-------|
| Root Directory | `client` |
| Build Command | `pnpm install && pnpm build` |
| Start Command | `pnpm start` |

Environment variables:

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

Redeploy after changing `NEXT_PUBLIC_API_URL` (it is baked in at build time).

### Two-service setup

Typical production layout:

| Service | Example URL |
|---------|-------------|
| Frontend | `https://lms-core-frontend.onrender.com` |
| Backend | `https://lms-core-backend.onrender.com` |

Cross-origin checklist:

1. Frontend `NEXT_PUBLIC_API_URL` → backend URL
2. Backend `CLIENT_URL` → frontend URL (exact match, `https`, no trailing slash)
3. Backend `JWT_SECRET` set and consistent if using JWT middleware
4. MongoDB Atlas allows Render IPs (`0.0.0.0/0`)
5. Seed admin + courses against production `MONGO_URI` from your machine (see server README)

## Project structure

```
client/
├── app/
│   ├── (auth)/           # login, register, admin login
│   ├── (protected)/      # dashboard, courses, admin panel
│   ├── layout.tsx
│   └── globals.css
├── components/ui/        # shadcn components
├── lib/
│   ├── api.ts            # client API helper
│   ├── api-server.ts     # server-side fetch (legacy)
│   └── auth-context.tsx
└── proxy.ts              # Next.js middleware hook (pass-through)
```

## Troubleshooting

| Issue | Likely cause |
|-------|----------------|
| Login succeeds but redirect back to login | Auth cookie on API domain; check CORS + `CLIENT_URL` |
| Stuck on loading spinner | `/auth/me` failing — check `NEXT_PUBLIC_API_URL` and API health |
| `OPTIONS` → 204 in Network tab | Normal CORS preflight, not an error |
| Admin page crashes (`null reading 'name'`) | Orphan enrollment data — reset DB and re-seed (server README) |
| Slow first load | Render free tier cold start on API; auth + page data load sequentially |
| Blank page after spinner | Page waiting on second API call; check Network for failed GET requests |

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [API server README](../server/README.md)
