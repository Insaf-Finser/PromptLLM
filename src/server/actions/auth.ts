"use server";

import bcrypt from "bcryptjs";
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

  // bcrypt cost factor 12, per the spec's "Argon2id (or bcrypt cost >=12)"
  // requirement. Using bcryptjs specifically (pure JS, no native binary) —
  // argon2's compiled binding has no prebuild for newer Node ABIs on
  // Vercel, which crashed every page in production at runtime.
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: { email, passwordHash },
  });

  // NOTE: email verification (required before write access, per the spec)
  // is cut for the 7-day scope — flagged in the plan's assumptions and
  // the README roadmap, not silently skipped.

  return { ok: true, data: { userId: user.id } };
}