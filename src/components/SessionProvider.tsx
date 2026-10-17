/**
 * SessionProvider Wrapper Component
 * Location: src/components/SessionProvider.tsx
 *
 * Wraps the app with NextAuth SessionProvider to enable useSession() hook
 */

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
