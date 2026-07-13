# Architecture

## Data model

```
User 1───N Prompt 1───N PromptVersion 1───N EvalRun 1───N EvalResult N───1 TestCase
                   └───N TestCase ───────────────────────────┘
```

- A **Prompt** is a container; a **PromptVersion** is an immutable snapshot of a
  template + model + system prompt.
- **TestCase**s belong to the Prompt, not a specific Version — they're the
  fixed input set you re-run across every version, which is what makes
  comparison meaningful.
- An **EvalRun** is one execution of a Version against every TestCase on its
  parent Prompt. Each **EvalResult** is one (run, test case) pair.

See `prisma/schema.prisma` for the full column-level contract, including which
nullable fields are deliberately required (e.g. `TestCase.expectedCriteria` —
a case with no definition of "good" can't be graded).

## Auth & authorization

Auth.js (Credentials provider) verifies email/password against `User.passwordHash`
(Argon2id) and issues a JWT session in an httpOnly, SameSite=Lax cookie.
`requireUserId()` in `src/lib/auth.ts` is the single chokepoint every server
action calls — no action trusts a `userId` passed from the client.

Row-level authorization is enforced by scoping every query with `userId` (for
Prompts) or by joining up to the owning Prompt (for Versions, TestCases,
EvalRuns, EvalResults). A missing resource and someone else's resource return
the identical "not found" error, so there's no way to distinguish the two from
the outside.

## Non-obvious decisions & trade-offs

- **Pass rate is `passed / graded`, not `passed / total`.** An ungraded result
  would otherwise silently count as a failure. Trade-off: the UI has to show
  "not graded yet" as a distinct state rather than defaulting to a number.
- **Eval runs execute test cases sequentially**, not in parallel. Simpler and
  avoids rate-limit surprises against the model API for a v1; the trade-off
  is a run against 20 test cases takes noticeably longer than it would with
  a concurrency cap. Flagged as a follow-up in the plan.
- **A missing variable value marks one EvalResult and continues the batch**
  rather than aborting the whole run — one bad test case shouldn't cost you
  the results for the other nine.
- **TestCases live at the Prompt level, not the Version level.** The
  alternative (test cases per version) would mean you couldn't compare two
  versions against literally the same inputs, which defeats the point of
  versioning in the first place.
- **Login rate limiting is in-memory**, not Redis-backed. Fine for a
  single-instance deploy; would need to move to a shared store before a
  multi-instance production deploy.
