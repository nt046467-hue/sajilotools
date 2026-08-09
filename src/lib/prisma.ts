import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  try {
    const url =
      process.env.TURSO_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "file:dev.db";
    const authToken = process.env.TURSO_AUTH_TOKEN;

    const adapter = new PrismaLibSql({
      url,
      ...(authToken ? { authToken } : {}),
    });

    return new PrismaClient({ adapter });
  } catch (err) {
    console.warn("LibSql adapter init warning, using standard client fallback:", err);
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
