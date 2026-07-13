"use server";

import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { runEvalSchema } from "@/lib/validators";
import { interpolateTemplate, findMissingVariables } from "@/lib/template";
import { callModel, LlmCallError } from "@/server/llm-client";
import type { ActionResult, EvalRunWithResults } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Runs a PromptVersion against every TestCase belonging to its parent
 * Prompt. Each test case is called independently — one timeout or
 * model error marks that single EvalResult, the run still completes
 * and reports the rest. This is the behavior the plan's edge cases
 * called out explicitly: a partial failure is not a failed run.
 */
export async function runEval(
  input: unknown
): Promise<ActionResult<EvalRunWithResults>> {
  const userId = await requireUserId();

  const parsed = runEvalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const version = await db.promptVersion.findFirst({
    where: { id: parsed.data.promptVersionId },
    include: { prompt: { select: { id: true, userId: true, testCases: true } } },
  });

  if (!version || version.prompt.userId !== userId) {
    return { ok: false, error: "Prompt version not found" };
  }

  const testCases = version.prompt.testCases;
  if (testCases.length === 0) {
    return { ok: false, error: "Add at least one test case before running an eval" };
  }

  const run = await db.evalRun.create({
    data: {
      promptVersionId: version.id,
      status: "running",
      startedAt: new Date(),
    },
  });

  // Fire calls sequentially rather than all at once — keeps this within
  // a reasonable rate against the model API for a v1 without needing a
  // queue. Parallelizing with a small concurrency cap is a good
  // follow-up once run sizes grow past a handful of test cases.
  for (const testCase of testCases) {
    const values = testCase.variableValues as Record<string, string>;
    const missing = findMissingVariables(version.variableNames, values);

    if (missing.length > 0) {
      await db.evalResult.create({
        data: {
          evalRunId: run.id,
          testCaseId: testCase.id,
          error: `Missing values for: ${missing.join(", ")}`,
        },
      });
      continue;
    }

    const userMessage = interpolateTemplate(version.templateText, values);

    try {
      const { outputText, latencyMs } = await callModel({
        model: version.model,
        systemPrompt: version.systemPrompt,
        userMessage,
      });

      await db.evalResult.create({
        data: {
          evalRunId: run.id,
          testCaseId: testCase.id,
          outputText,
          latencyMs,
        },
      });
    } catch (err) {
      await db.evalResult.create({
        data: {
          evalRunId: run.id,
          testCaseId: testCase.id,
          error: err instanceof LlmCallError ? err.message : "Unexpected error",
        },
      });
    }
  }

  const completedRun = await db.evalRun.update({
    where: { id: run.id },
    data: { status: "completed", completedAt: new Date() },
    include: { results: { include: { testCase: true } } },
  });

  revalidatePath(`/prompts/${version.prompt.id}/versions/${version.id}`);

  return {
    ok: true,
    data: {
      id: completedRun.id,
      promptVersionId: completedRun.promptVersionId,
      status: completedRun.status,
      startedAt: completedRun.startedAt?.toISOString() ?? null,
      completedAt: completedRun.completedAt?.toISOString() ?? null,
      createdAt: completedRun.createdAt.toISOString(),
      results: completedRun.results.map((r) => ({
        id: r.id,
        evalRunId: r.evalRunId,
        testCaseId: r.testCaseId,
        outputText: r.outputText,
        latencyMs: r.latencyMs,
        pass: r.pass,
        graderNotes: r.graderNotes,
        error: r.error,
        createdAt: r.createdAt.toISOString(),
        testCase: {
          id: r.testCase.id,
          promptId: r.testCase.promptId,
          name: r.testCase.name,
          variableValues: r.testCase.variableValues as Record<string, string>,
          expectedCriteria: r.testCase.expectedCriteria,
          createdAt: r.testCase.createdAt.toISOString(),
        },
      })),
    },
  };
}

/**
 * Records a manual pass/fail grade for a single result. Grading is
 * separate from running — you can re-grade without re-calling the model.
 */
export async function gradeResult(input: {
  evalResultId: string;
  pass: boolean;
  graderNotes?: string;
}): Promise<ActionResult<null>> {
  const userId = await requireUserId();

  // Ownership check walks EvalResult -> EvalRun -> PromptVersion -> Prompt.
  const result = await db.evalResult.findFirst({
    where: { id: input.evalResultId },
    include: {
      evalRun: {
        include: { promptVersion: { include: { prompt: true } } },
      },
    },
  });

  if (!result || result.evalRun.promptVersion.prompt.userId !== userId) {
    return { ok: false, error: "Result not found" };
  }

  await db.evalResult.update({
    where: { id: input.evalResultId },
    data: { pass: input.pass, graderNotes: input.graderNotes ?? null },
  });

  revalidatePath(
    `/prompts/${result.evalRun.promptVersion.prompt.id}/versions/${result.evalRun.promptVersion.id}`
  );
  return { ok: true, data: null };
}
