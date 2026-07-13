import { withAuth } from "next-auth/middleware";

// Server actions already enforce auth via requireUserId() — this is a
// second layer that redirects unauthenticated visitors before a protected
// page even starts rendering, instead of letting them hit a thrown error.
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/prompts/:path*"],
};
