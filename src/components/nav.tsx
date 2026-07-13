import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { SignOutButton } from "./sign-out-button";

export async function Nav() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight text-neutral-900">
          PromptDesk
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {session?.user ? (
            <>
              <Link
                href="/prompts"
                className="text-neutral-600 hover:text-neutral-900"
              >
                Prompts
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-600 hover:text-neutral-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
