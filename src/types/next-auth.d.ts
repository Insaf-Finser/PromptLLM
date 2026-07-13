import "next-auth";
import "next-auth/jwt";

// Augments NextAuth's built-in types with the userId we attach in the
// jwt/session callbacks (see src/lib/auth-options.ts). This replaces the
// `as { id?: string }` casts that would otherwise be needed at every
// call site that reads session.user.id.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
  }
}
