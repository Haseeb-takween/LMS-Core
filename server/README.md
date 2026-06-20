# LMS Core — API Server

Express + TypeScript REST API for the LMS Core learning management system. Handles authentication, courses, enrollments, attendance, quizzes, and certificates.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+
- MongoDB ([Atlas](https://www.mongodb.com/atlas) or local)

## Quick start (local)

```bash
cd server
pnpm install
cp .env.example .env
```

Edit `.env` with your values (see [Environment variables](#environment-variables)), then:

```bash
pnpm seed:admin      # create admin user (requires ADMIN_EMAIL + ADMIN_PASSWORD)
pnpm seed:courses    # create demo courses, sessions, and quizzes
pnpm dev             # start dev server on http://localhost:5000
```

Verify: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server with hot reload (`ts-node-dev`) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run production build (`node dist/index.js`) |
| `pnpm type-check` | Typecheck without emitting |
| `pnpm seed:admin` | Create or update admin user |
| `pnpm seed:courses` | Seed demo courses (idempotent by course title) |

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing auth tokens |
| `JWT_EXPIRES_IN` | No | Token lifetime in seconds (default: `86400`) |
| `CLIENT_URL` | Yes (prod) | Frontend origin for CORS, e.g. `http://localhost:3000` |
| `PORT` | No | Server port (default: `5000`) |
| `HOST` | No | Log label only (default: `localhost`) |
| `NODE_ENV` | No | `development` or `production` |
| `ADMIN_NAME` | For seed | Admin display name (default: `Admin`) |
| `ADMIN_EMAIL` | For seed | Admin login email |
| `ADMIN_PASSWORD` | For seed | Admin login password |

In production, cookies use `Secure` + `SameSite=None` when `NODE_ENV=production`.

## API overview

Base path: `/api/v1`

### Public / health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/` | Same as health |

### Auth (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register student |
| POST | `/login` | — | Login (sets `token` cookie) |
| POST | `/logout` | — | Clear cookie |
| GET | `/me` | User | Current user |

### Courses (`/courses`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | User | List active courses |
| GET | `/:id` | User | Course detail + sessions |

### Enrollments (`/enrollments`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | User | Request enrollment |
| GET | `/my` | User | My enrollments |
| GET | `/:id/sessions` | User | Sessions for enrollment |
| GET | `/:id/sessions/:sessionId` | User | Session + quiz |
| POST | `/:id/sessions/:sessionId/quiz/submit` | User | Submit quiz |
| GET | `/:id/attendance` | User | Attendance summary |
| GET | `/:id/certificate` | User | Certificate status |
| GET | `/:id/certificate/download` | User | Download PDF |

### Admin (`/admin`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | — | Admin login |
| GET | `/stats` | Admin | Dashboard stats |
| GET | `/enrollments` | Admin | List enrollments |
| PATCH | `/enrollments/:id/approve` | Admin | Approve enrollment |
| PATCH | `/enrollments/:id/reject` | Admin | Reject enrollment |
| GET | `/attendance` | Admin | Attendance overview |
| POST | `/attendance` | Admin | Mark attendance |
| PATCH | `/attendance/:id` | Admin | Update attendance |
| GET | `/certificates` | Admin | Certificate requests |
| PATCH | `/certificates/:id/approve` | Admin | Approve certificate |
| PATCH | `/certificates/:id/reject` | Admin | Reject certificate |
| GET | `/quiz-results` | Admin | Quiz submissions |
| GET | `/courses/:courseId/roster` | Admin | Course roster grid |

## Seeding

Seed scripts run locally with `tsx` and read from `.env` (or environment variables).

```bash
pnpm seed:admin
pnpm seed:courses
```

### Seed production database from your machine

Point `MONGO_URI` at your Atlas cluster (same string as on Render):

```bash
# PowerShell
$env:MONGO_URI="mongodb+srv://..."
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="your-secure-password"
pnpm seed:admin
pnpm seed:courses
```

Ensure Atlas **Network Access** allows your IP.

### Reset production data

1. In MongoDB Atlas, drop the database or these collections: `users`, `courses`, `sessions`, `quizzes`, `enrollments`, `attendances`, `quizsubmissions`, `certificates`.
2. Re-run `seed:admin` and `seed:courses` from your machine against the production `MONGO_URI`.

> Seed scripts are not compiled to `dist/` and `tsx` is a dev dependency — run seeds locally, not on the Render web service shell.

## Deploy on Render

Use the repo root `render.yaml` or configure manually:

| Setting | Value |
|---------|-------|
| Root Directory | `server` |
| Build Command | `pnpm install && pnpm build` |
| Start Command | `pnpm start` |
| Health Check Path | `/api/v1/health` |

Required environment variables on Render:

- `NODE_ENV=production`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL` — exact frontend URL, e.g. `https://your-frontend.onrender.com` (no trailing slash)

After deploy, seed the database from your local machine (see above).

## Project structure

```
server/
├── src/
│   ├── config/       # env, database
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.ts
│   └── index.ts
├── scripts/          # seed scripts (dev only)
└── dist/             # build output (gitignored)
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cannot find module dist/index.js` on deploy | Set build command to `pnpm install && pnpm build` |
| MongoDB connection failed | Whitelist `0.0.0.0/0` in Atlas Network Access for Render |
| CORS errors | `CLIENT_URL` must exactly match the frontend origin |
| `tsx: command not found` when seeding on Render | Run seeds locally against `MONGO_URI` |
| Admin login fails after deploy | Run `pnpm seed:admin` with production `MONGO_URI` |
