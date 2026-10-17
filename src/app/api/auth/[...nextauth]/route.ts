/**
 * NextAuth.js API Route Handler
 * Location: src/app/api/auth/[...nextauth]/route.ts
 *
 * This catch-all route handles all NextAuth.js authentication endpoints:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/providers
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create the NextAuth handler with our configuration
const handler = NextAuth(authOptions);

// Export as GET and POST for App Router compatibility
export { handler as GET, handler as POST };
