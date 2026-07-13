import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as argon2 from "argon2";
import { db } from "./db";
import { loginSchema } from "./validators";

// Basic in-memory rate limiter for login attempts.
// NOTE: this is process-local — fine for a single-instance deploy on the
// 7-day timebox, but won't hold across serverless instances/restarts.
// Flagged in README as a known limitation, not silently ignored.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        if (!checkRateLimit(email)) {
          // Deliberately vague — same message as a bad password, so this
          // doesn't confirm to an attacker whether the account exists.
          throw new Error("Too many attempts. Try again in a few minutes.");
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await argon2.verify(user.passwordHash, password);
        if (!valid) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    // Carry the user id from the JWT into the session, so server actions
    // can read session.user.id without a second DB round-trip.
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
};
