"use client";

import { SessionProvider } from "next-auth/react";

// Wraps the app so any client component can call useSession() if needed
// later. signIn()/signOut() (used today in the login/signup forms and
// SignOutButton) don't strictly require this, but it's the standard
// NextAuth setup and avoids a surprise when the first client component
// that does need useSession() gets added.
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
