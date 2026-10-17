/**
 * NextAuth.js Type Definitions
 * Location: src/types/next-auth.d.ts
 *
 * Extends the default NextAuth types to include custom properties
 * like 'role' on the User and Session objects
 */

import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
  }
}
