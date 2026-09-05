async function main() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || url.startsWith("file:")) {
    console.log("[DB Setup] Skipping Turso schema sync (using local file DB or no TURSO_DATABASE_URL provided).");
    return;
  }

  let createClient;
  try {
    createClient = require("@libsql/client").createClient;
  } catch (err) {
    console.log("[DB Setup] @libsql/client not installed, skipping Turso sync.");
    return;
  }

  console.log("[DB Setup] Connecting to Turso database at:", url);
  const db = createClient({ url, authToken });

  const statements = [
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT,
      "passwordHash" TEXT,
      "provider" TEXT NOT NULL DEFAULT 'credentials',
      "role" TEXT NOT NULL DEFAULT 'user',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "ShortLink" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "longUrl" TEXT NOT NULL,
      "clicks" INTEGER NOT NULL DEFAULT 0,
      "userId" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "expiresAt" DATETIME,
      "deleteToken" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "Subscription" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL UNIQUE,
      "plan" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerRefId" TEXT,
      "currentPeriodEnd" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "Tool" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "isPro" BOOLEAN NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "runsOn" TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS "UsageLog" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT,
      "sessionId" TEXT,
      "toolSlug" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "Favorite" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "toolSlug" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("userId", "toolSlug")
    );`,

    `CREATE TABLE IF NOT EXISTS "Subscriber" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "type" TEXT NOT NULL,
      "path" TEXT,
      "toolSlug" TEXT,
      "query" TEXT,
      "isHelpful" BOOLEAN,
      "comment" TEXT,
      "errorMsg" TEXT,
      "sessionId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const stmt of statements) {
    try {
      await db.execute(stmt);
    } catch (e) {
      console.warn("[DB Setup] Statement warning:", e?.message || e);
    }
  }

  // Safe migrations for newly added columns on existing databases
  const alterMigrations = [
    `ALTER TABLE "ShortLink" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT 1;`,
    `ALTER TABLE "ShortLink" ADD COLUMN "expiresAt" DATETIME;`,
    `ALTER TABLE "ShortLink" ADD COLUMN "deleteToken" TEXT;`
  ];

  for (const alterStmt of alterMigrations) {
    try {
      await db.execute(alterStmt);
    } catch (e) {
      // Column likely already exists, ignore safely
    }
  }

  console.log("✅ [DB Setup] Turso tables created successfully!");
}

main().catch((err) => {
  console.error("[DB Setup Warning]", err.message);
});
