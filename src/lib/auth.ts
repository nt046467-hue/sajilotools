import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const getNextAuthSecret = (): string => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
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
