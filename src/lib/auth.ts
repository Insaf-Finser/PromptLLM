import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

/**
 * Returns the current user's id from the session, or throws.
 * Every server action calls this instead of trusting a userId passed
 * from the client — auth is enforced server-side, always.
 */
export async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }

  return userId;
}
