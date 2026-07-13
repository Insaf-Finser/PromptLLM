"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-neutral-600 hover:text-neutral-900"
    >
      Log out
    </button>
  );
}
