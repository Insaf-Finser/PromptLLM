// PromptDesk — Shared Zod Validators
// Used on BOTH the client (form validation) and server (action/API boundary).
// Never validate the same rule two different ways in two different places.

import { z } from "zod";

// ─────────────────────────────────────────────
// Prompts
// ─────────────────────────────────────────────

export const createPromptSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

// ─────────────────────────────────────────────
// Versions
// ─────────────────────────────────────────────

// Groq free-tier models (no credit card required) — see
// console.groq.com/docs/models for the current catalog. Kept as an
// explicit allow-list, same as before: stops someone creating a version
// pointing at a model llm-client.ts doesn't know how to call.
export const SUPPORTED_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
] as const;

export const createVersionSchema = z.object({
  promptId: z.string().uuid(),
  templateText: z
    .string()
    .min(1, "Template can't be empty")
    .max(20_000, "Template is too long"),
  model: z.enum(SUPPORTED_MODELS),
  systemPrompt: z.string().max(5_000).optional(),
});

// ─────────────────────────────────────────────
// Test Cases
// expectedCriteria is required at the schema level — a test case with no
// definition of "good" can't be graded, manually or automatically.
// ─────────────────────────────────────────────

export const createTestCaseSchema = z.object({
  promptId: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(100),
  variableValues: z.record(z.string(), z.string()),
  expectedCriteria: z
    .string()
    .min(1, "Describe what a good response looks like")
    .max(1_000),
});

// Cross-field check done at the server-action layer (not expressible in the
// static schema alone): variableValues must contain every variable the
// version's templateText declares. See src/server/actions/test-cases.ts.

// ─────────────────────────────────────────────
// Eval Runs
// ─────────────────────────────────────────────

export const runEvalSchema = z.object({
  promptVersionId: z.string().uuid(),
});

export const gradeResultSchema = z.object({
  evalResultId: z.string().uuid(),
  pass: z.boolean(),
  graderNotes: z.string().max(500).optional(),
});

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(72), // bcrypt/argon2 truncate beyond this — cap it explicitly
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─────────────────────────────────────────────
// Template helper — extracts {{variable}} names from a template string.
// Shared by the client editor (live variable list) and the server (to
// validate TestCase.variableValues covers every declared variable).
// ─────────────────────────────────────────────

export function extractVariableNames(templateText: string): string[] {
  const matches = templateText.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
  const names = new Set<string>();
  for (const match of matches) {
    const name = match[1];
    if (name !== undefined) {
      names.add(name);
    }
  }
  return Array.from(names);
}