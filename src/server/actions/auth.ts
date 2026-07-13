"use server";

import * as argon2 from "argon2";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/validators";
import type { ActionResult } from "@/types";

export async function signupUser(
  input: unknown
): Promise<ActionResult<{ userId: string }>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Same generic message either way — don't confirm account existence
    // to whoever's submitting the form.
    return { ok: false, error: "Could not create account with those details" };
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const user = await db.user.create({
    data: { email, passwordHash },
  });

  // NOTE: email verification (required before write access, per the spec)
  // is cut for the 7-day scope — flagged in the plan's assumptions and
  // the README roadmap, not silently skipped.

  return { ok: true, data: { userId: user.id } };
}
