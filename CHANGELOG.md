# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Email/password authentication (Auth.js, Argon2id, JWT sessions).
- Prompt CRUD (create, list, view, delete).
- Prompt versions with live `{{variable}}` extraction.
- Test cases scoped to a prompt, shared across its versions.
- Eval runs against the Groq API (free tier, no credit card), with per-test-case error isolation.
- Manual pass/fail grading on eval results.
- Side-by-side version comparison with pass-rate summaries.
- SEO: metadata, OG image, sitemap, robots.txt, JSON-LD (SoftwareApplication, FAQPage).
- CI: lint, typecheck, unit tests, build on every push.

### Known limitations (see README roadmap)
- Single model provider (Anthropic) for v1.
- No email verification or password reset flow yet.
- Login rate limiting is in-memory, not distributed.
- Eval runs call test cases sequentially, not in parallel.
