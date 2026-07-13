"use server";

import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { createPromptSchema } from "@/lib/validators";
import type { ActionResult, Prompt } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Creates a new Prompt owned by the current user.
 * Validation happens once, here, using the same Zod schema the client
 * form uses — so client and server reject exactly the same bad input.
 */
export async function createPrompt(
  input: unknown
): Promise<ActionResult<Prompt>> {
  const userId = await requireUserId();

  const parsed = createPromptSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const prompt = await db.prompt.create({
    data: {
      userId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    },
  });

  revalidatePath("/prompts");
  return { ok: true, data: serializePrompt(prompt) };
}

/**
 * Lists all prompts belonging to the current user, most recently
 * updated first. Row-level scoping — never a global query filtered
 * client-side.
 */
export async function listPrompts(): Promise<ActionResult<Prompt[]>> {
  const userId = await requireUserId();

  const prompts = await db.prompt.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return { ok: true, data: prompts.map(serializePrompt) };
}

/**
 * Fetches a single prompt by id. Returns an error — not another user's
 * data — if the prompt doesn't belong to the requesting user, so this
 * doubles as the authorization check.
 */
export async function getPrompt(promptId: string): Promise<ActionResult<Prompt>> {
  const userId = await requireUserId();

  const prompt = await db.prompt.findFirst({
    where: { id: promptId, userId },
  });

  if (!prompt) {
    return { ok: false, error: "Prompt not found" };
  }

  return { ok: true, data: serializePrompt(prompt) };
}

/**
 * Deletes a prompt (and cascades to its versions/test cases/eval runs
 * per the schema's onDelete: Cascade). Ownership is re-checked here,
 * not assumed from the UI having only shown the user their own prompts.
 */
export async function deletePrompt(promptId: string): Promise<ActionResult<null>> {
  const userId = await requireUserId();

  const existing = await db.prompt.findFirst({
    where: { id: promptId, userId },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false, error: "Prompt not found" };
  }

  await db.prompt.delete({ where: { id: promptId } });

  revalidatePath("/prompts");
  return { ok: true, data: null };
}

// ─────────────────────────────────────────────

function serializePrompt(prompt: {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Prompt {
  return {
    id: prompt.id,
    userId: prompt.userId,
    name: prompt.name,
    description: prompt.description,
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
  };
}
