import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

function safeCompareStrings(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function getAdminSecretKey(): string {
  return process.env.ADMIN_SECRET_KEY || "5ajilo";
}

export async function verifyAdminRequest(req: NextRequest): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    const isSessionAdmin = (session?.user as any)?.role === "admin";
    if (isSessionAdmin) return true;

    const adminSecret = getAdminSecretKey();
    const providedKey = req.headers.get("x-admin-key");

    if (adminSecret && providedKey && safeCompareStrings(providedKey, adminSecret)) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("Admin verification error:", err);
    return false;
  }
}
