// PromptDesk — Shared Types
// Mirrors prisma/schema.prisma. Import from here everywhere — never redeclare
// these shapes inline in a component or server action.

export type EvalRunStatus = "pending" | "running" | "completed" | "failed";

// ─────────────────────────────────────────────
// Core entities (mirror DB rows)
// ─────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  createdAt: string; // ISO string over the wire; Date only inside server code
}

export interface Prompt {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  versionNumber: number;
  templateText: string;
  variableNames: string[];
  model: string;
  systemPrompt: string | null;
  createdAt: string;
}

export interface TestCase {
  id: string;
  promptId: string;
  name: string;
  variableValues: Record<string, string>;
  expectedCriteria: string;
  createdAt: string;
}

export interface EvalRun {
  id: string;
  promptVersionId: string;
  status: EvalRunStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface EvalResult {
  id: string;
  evalRunId: string;
  testCaseId: string;
  outputText: string | null;
  latencyMs: number | null;
  pass: boolean | null; // null = ungraded yet
  graderNotes: string | null;
  error: string | null;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Composite / hydrated shapes (for dashboard + comparison views)
// ─────────────────────────────────────────────

export interface EvalRunWithResults extends EvalRun {
  results: (EvalResult & { testCase: TestCase })[];
}

export interface PromptVersionSummary extends PromptVersion {
  latestRun: EvalRunWithResults | null;
  passRate: number | null; // passed / graded, NOT passed / total — null if nothing graded yet
}

export interface VersionComparison {
  promptId: string;
  left: PromptVersionSummary;
  right: PromptVersionSummary;
}

// ─────────────────────────────────────────────
// Server action input/output contracts
// (paired 1:1 with Zod schemas in src/lib/validators.ts)
// ─────────────────────────────────────────────

export interface CreatePromptInput {
  name: string;
  description?: string;
}

export interface CreateVersionInput {
  promptId: string;
  templateText: string;
  model: string;
  systemPrompt?: string;
}

export interface CreateTestCaseInput {
  promptId: string;
  name: string;
  variableValues: Record<string, string>;
  expectedCriteria: string;
}

export interface RunEvalInput {
  promptVersionId: string;
}

export interface GradeResultInput {
  evalResultId: string;
  pass: boolean;
  graderNotes?: string;
}

// ─────────────────────────────────────────────
// Error contract — every server action that can fail returns this shape
// instead of throwing across the client/server boundary
// ─────────────────────────────────────────────

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
