import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Lazily resolves NEXTAUTH_SECRET.
 * During `next build` NODE_ENV is "production" but secrets aren't available,
 * so we return a build-time placeholder. At actual runtime the real secret is required.
 */
const getNextAuthSecret = (): string => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) return secret;

  // NEXT_PHASE is set by Next.js during build ("phase-production-build")
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  if (isBuildPhase) {
    return "build-time-placeholder-not-used-at-runtime";
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("CRITICAL SECURITY ERROR: NEXTAUTH_SECRET environment variable is missing in production.");
  }
  console.warn("⚠️ [DEV ONLY] NEXTAUTH_SECRET is not set. Using dev-only fallback secret.");
  return "dev-only-insecure-fallback-set-nextauth-secret-in-env";
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isCorrectPassword) {
            return null;
          }

          return user;
        } catch (error) {
          console.warn("Auth database query error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: getNextAuthSecret(),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
