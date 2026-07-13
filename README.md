# PromptDesk

> Version and eval-test your LLM prompts — see the pass rate before you ship a change.

**Live demo →** _add your deployed URL here_
**Demo login →** `demo@demo.com` / `demo1234` (after running the seed script)

## Features

- Sign up / log in with email + password (Argon2id, httpOnly session cookie)
- Create prompts and save immutable, versioned templates with `{{variable}}` placeholders
- Live variable detection as you type — same parser client and server
- Define test cases once per prompt, reuse them across every version
- Run a version against its test cases against the real model, via Groq's free API (no credit card required)
- Grade results pass/fail and see a pass rate (`passed / graded`, never silently counting the ungraded)
- Compare two versions of the same prompt side by side

## Tech Stack

Next.js (App Router) · TypeScript (strict) · PostgreSQL (Prisma) · Tailwind CSS · Auth.js · Zod · Groq API · Vercel

## Quick Start

```bash
git clone https://github.com/you/promptdesk && cd promptdesk
cp .env.example .env   # then fill in real values — see table below
npm install
npm run db:migrate
npm run db:seed        # optional — creates the demo login above
npm run dev             # http://localhost:3000
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `NEXTAUTH_SECRET` | Session signing secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `GROQ_API_KEY` | Server-only. Powers the "Run eval" feature — get a free key at [console.groq.com/keys](https://console.groq.com/keys), no credit card required. Without it, eval runs fail with a clear error rather than doing nothing silently |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for sitemap/OG/canonical tags |

## Architecture

See [docs/architecture.md](./docs/architecture.md) for the data model diagram,
how auth/authorization work, and the non-obvious decisions with their trade-offs.

## Testing

```bash
npm run test       # unit tests — template parsing, validators
npm run test:e2e   # Playwright — the core signup → prompt → version flow
```

The eval-run e2e test is skipped unless `GROQ_API_KEY` is set — CI doesn't set it,
so the suite never depends on a live key by default. Set it locally to run that
test too; Groq's free tier means it costs nothing. See `tests/e2e/core-flow.spec.ts`.

## Roadmap

- [x] Auth, prompt/version CRUD, test cases, eval runs, manual grading, version comparison
- [ ] Email verification before write access
- [ ] Password reset flow
- [ ] Additional model providers (OpenAI, etc.) for cross-provider comparison
- [ ] LLM-as-judge automated grading, alongside manual pass/fail
- [ ] Bounded-concurrency eval runs instead of sequential
- [ ] Distributed (Redis-backed) login rate limiting

## Screenshots

_Add 3–5 screenshots here: prompts list, version editor with live variables, eval results, comparison view._

## Known Limitations

- Single LLM provider (Anthropic) for v1 — see roadmap.
- No email verification / password reset yet.
- Login rate limiting is in-memory (single-instance only).
- Eval runs call the model sequentially per test case, not in parallel.

## License

MIT — see [LICENSE](./LICENSE).

---
Built as part of the [Digital Heroes](https://digitalheroes.dev) Full Stack
Developer trial.
