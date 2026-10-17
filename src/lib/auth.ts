/**
 * NextAuth.js Configuration
 * Location: src/lib/auth.ts
 *
 * This file exports the authOptions for NextAuth.js
 * Uses CredentialsProvider with environment variables for admin authentication
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  // Secret for JWT encryption - REQUIRED for production
  secret: process.env.NEXTAUTH_SECRET,

  // Configure authentication providers
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate that credentials were provided
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const { username, password } = credentials;

        // Check against Admin 1 credentials
        if (
          username === process.env.ADMIN1_USER &&
          password === process.env.ADMIN1_PASS
        ) {
          return {
            id: "admin-1",
            name: "Admin 1",
            email: "admin1@navx.local",
            role: "admin",
          };
        }

        // Check against Admin 2 credentials
        if (
          username === process.env.ADMIN2_USER &&
          password === process.env.ADMIN2_PASS
        ) {
          return {
            id: "admin-2",
            name: "Admin 2",
            email: "admin2@navx.local",
            role: "admin",
          };
        }

        // Invalid credentials
        return null;
      },
    }),
  ],

  // Custom pages configuration
  pages: {
    signIn: "/login", // Redirect to our custom login page
  },

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // Callbacks for customizing JWT and session
  callbacks: {
    async jwt({ token, user }) {
      // Add role to JWT token on sign in
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session for client-side access
      if (session.user) {
        (session.user as { role?: string; id?: string }).role =
          token.role as string;
        (session.user as { role?: string; id?: string }).id =
          token.id as string;
      }
      return session;
    },
  },
};
