# Contributing to PromptDesk

## Local setup

See the Quick Start in [README.md](./README.md) — clone, copy `.env.example`
to `.env`, fill in real values, `npm install`, migrate, `npm run dev`.

## Branching & commits

- Branch per feature: `feat/eval-run-concurrency`, `fix/pass-rate-rounding`.
- Never push directly to `main`.
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Keep commits small and working — a commit should do one thing and pass CI
  on its own.

## Before opening a PR

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

All four must pass locally before you open a PR — CI runs the same checks
and will block merge on failure.

## PR description

State what changed and why, not just what. If the change affects the schema
(`prisma/schema.prisma`) or the shared types (`src/types/index.ts`), say so
explicitly — those are the contract everything else depends on.

## Rebasing

Rebase on `main` before opening a PR rather than resolving conflicts in the
merge queue later.
