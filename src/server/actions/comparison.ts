"use server";

import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import type { ActionResult, PromptVersionSummary } from "@/types";

/**
 * Builds a comparable summary for a version: its most recent completed
 * run, plus a pass rate computed as passed/graded — never passed/total,
 * so ungraded results don't silently count against the version.
 */
export async function getVersionSummary(
  versionId: string
): Promise<ActionResult<PromptVersionSummary>> {
  const userId = await requireUserId();

  const version = await db.promptVersion.findFirst({
    where: { id: versionId },
    include: {
      prompt: { select: { userId: true } },
      evalRuns: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { results: { include: { testCase: true } } },
      },
    },
  });

  if (!version || version.prompt.userId !== userId) {
    return { ok: false, error: "Version not found" };
  }

  const latestRun = version.evalRuns[0] ?? null;
  const graded = latestRun?.results.filter((r) => r.pass !== null) ?? [];
  const passed = graded.filter((r) => r.pass === true);
  const passRate = graded.length > 0 ? passed.length / graded.length : null;

  return {
    ok: true,
    data: {
      id: version.id,
      promptId: version.promptId,
      versionNumber: version.versionNumber,
      templateText: version.templateText,
      variableNames: version.variableNames,
      model: version.model,
      systemPrompt: version.systemPrompt,
      createdAt: version.createdAt.toISOString(),
      passRate,
      latestRun: latestRun
        ? {
            id: latestRun.id,
            promptVersionId: latestRun.promptVersionId,
            status: latestRun.status,
            startedAt: latestRun.startedAt?.toISOString() ?? null,
            completedAt: latestRun.completedAt?.toISOString() ?? null,
            createdAt: latestRun.createdAt.toISOString(),
            results: latestRun.results.map((r) => ({
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
          }
        : null,
    },
  };
}

/**
 * Confirms two versions belong to the same prompt before returning
 * them for a side-by-side view — enforced here, not just hidden in
 * the UI's version picker.
 */
export async function compareVersions(
  leftVersionId: string,
  rightVersionId: string
): Promise<ActionResult<{ leftPromptId: string; rightPromptId: string }>> {
  const userId = await requireUserId();

  const [left, right] = await Promise.all([
    db.promptVersion.findFirst({
      where: { id: leftVersionId },
      select: { promptId: true, prompt: { select: { userId: true } } },
    }),
    db.promptVersion.findFirst({
      where: { id: rightVersionId },
      select: { promptId: true, prompt: { select: { userId: true } } },
    }),
  ]);

  if (!left || !right || left.prompt.userId !== userId || right.prompt.userId !== userId) {
    return { ok: false, error: "Version not found" };
  }

  if (left.promptId !== right.promptId) {
    return { ok: false, error: "Can only compare versions of the same prompt" };
  }

  return {
    ok: true,
    data: { leftPromptId: left.promptId, rightPromptId: right.promptId },
  };
}
