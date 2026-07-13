"use server";

import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { createTestCaseSchema } from "@/lib/validators";
import type { ActionResult, TestCase } from "@/types";
import { revalidatePath } from "next/cache";

export async function createTestCase(
  input: unknown
): Promise<ActionResult<TestCase>> {
  const userId = await requireUserId();

  const parsed = createTestCaseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const prompt = await db.prompt.findFirst({
    where: { id: parsed.data.promptId, userId },
    select: { id: true },
  });
  if (!prompt) {
    return { ok: false, error: "Prompt not found" };
  }

  const testCase = await db.testCase.create({
    data: {
      promptId: parsed.data.promptId,
      name: parsed.data.name,
      variableValues: parsed.data.variableValues,
      expectedCriteria: parsed.data.expectedCriteria,
    },
  });

  revalidatePath(`/prompts/${parsed.data.promptId}`);
  return { ok: true, data: serializeTestCase(testCase) };
}

export async function listTestCases(
  promptId: string
): Promise<ActionResult<TestCase[]>> {
  const userId = await requireUserId();

  const prompt = await db.prompt.findFirst({
    where: { id: promptId, userId },
    select: { id: true },
  });
  if (!prompt) {
    return { ok: false, error: "Prompt not found" };
  }

  const testCases = await db.testCase.findMany({
    where: { promptId },
    orderBy: { createdAt: "asc" },
  });

  return { ok: true, data: testCases.map(serializeTestCase) };
}

// ─────────────────────────────────────────────

function serializeTestCase(testCase: {
  id: string;
  promptId: string;
  name: string;
  variableValues: unknown;
  expectedCriteria: string;
  createdAt: Date;
}): TestCase {
  return {
    id: testCase.id,
    promptId: testCase.promptId,
    name: testCase.name,
    variableValues: testCase.variableValues as Record<string, string>,
    expectedCriteria: testCase.expectedCriteria,
    createdAt: testCase.createdAt.toISOString(),
  };
}
