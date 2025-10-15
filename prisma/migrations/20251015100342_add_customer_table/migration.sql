-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chaser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task" TEXT NOT NULL,
    "documents" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "customerId" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL,
    "currentAttempt" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "nextOutreachAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "Chaser_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Chaser" ("completedAt", "contactEmail", "contactName", "contactPhone", "createdAt", "currentAttempt", "documents", "id", "maxAttempts", "nextOutreachAt", "status", "task", "updatedAt", "urgency", "who") SELECT "completedAt", "contactEmail", "contactName", "contactPhone", "createdAt", "currentAttempt", "documents", "id", "maxAttempts", "nextOutreachAt", "status", "task", "updatedAt", "urgency", "who" FROM "Chaser";
DROP TABLE "Chaser";
ALTER TABLE "new_Chaser" RENAME TO "Chaser";
CREATE INDEX "Chaser_customerId_idx" ON "Chaser"("customerId");
CREATE INDEX "Chaser_status_idx" ON "Chaser"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
