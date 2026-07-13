"use server";

import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { createVersionSchema, extractVariableNames } from "@/lib/validators";
import type { ActionResult, PromptVersion } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Creates a new Version under a Prompt. Ownership is enforced by joining
 * through the Prompt (never trust a promptId alone) — this is also where
 * the auto-incrementing versionNumber is computed, inside the same query
 * path so two concurrent creates can't race to the same number in practice
 * for this scale (a unique constraint on (promptId, versionNumber) is the
 * hard backstop either way — see prisma/schema.prisma).
 */
export async function createVersion(
  input: unknown
): Promise<ActionResult<PromptVersion>> {
  const userId = await requireUserId();

  const parsed = createVersionSchema.safeParse(input);
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

  const last = await db.promptVersion.findFirst({
    where: { promptId: parsed.data.promptId },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });
  const nextVersionNumber = (last?.versionNumber ?? 0) + 1;

  // Extracted server-side from the same templateText that gets saved —
  // never accept a client-supplied variableNames array as-is.
  const variableNames = extractVariableNames(parsed.data.templateText);

  const version = await db.promptVersion.create({
    data: {
      promptId: parsed.data.promptId,
      versionNumber: nextVersionNumber,
      templateText: parsed.data.templateText,
      variableNames,
      model: parsed.data.model,
      systemPrompt: parsed.data.systemPrompt ?? null,
    },
  });

  revalidatePath(`/prompts/${parsed.data.promptId}`);
  return { ok: true, data: serializeVersion(version) };
}

/**
 * Fetches a single version, checking ownership via the parent Prompt.
 */
export async function getVersion(
  versionId: string
): Promise<ActionResult<PromptVersion>> {
  const userId = await requireUserId();

  const version = await db.promptVersion.findFirst({
    where: { id: versionId },
    include: { prompt: { select: { userId: true } } },
  });

  if (!version || version.prompt.userId !== userId) {
    return { ok: false, error: "Version not found" };
  }

  return { ok: true, data: serializeVersion(version) };
}

/**
 * Lists all versions of a prompt, newest first. Ownership checked via
 * the parent Prompt so this doubles as the authorization boundary.
 */
export async function listVersions(
  promptId: string
): Promise<ActionResult<PromptVersion[]>> {
  const userId = await requireUserId();

  const prompt = await db.prompt.findFirst({
    where: { id: promptId, userId },
    select: { id: true },
  });
  if (!prompt) {
    return { ok: false, error: "Prompt not found" };
  }

  const versions = await db.promptVersion.findMany({
    where: { promptId },
    orderBy: { versionNumber: "desc" },
  });

  return { ok: true, data: versions.map(serializeVersion) };
}

// ─────────────────────────────────────────────

function serializeVersion(version: {
  id: string;
  promptId: string;
  versionNumber: number;
  templateText: string;
  variableNames: string[];
  model: string;
  systemPrompt: string | null;
  createdAt: Date;
}): PromptVersion {
  return {
    id: version.id,
    promptId: version.promptId,
    versionNumber: version.versionNumber,
    templateText: version.templateText,
    variableNames: version.variableNames,
    model: version.model,
    systemPrompt: version.systemPrompt,
    createdAt: version.createdAt.toISOString(),
  };
}
