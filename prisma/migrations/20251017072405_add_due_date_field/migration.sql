/*
  Warnings:

  - Added the required column `dueDate` to the `Chaser` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chaser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "documents" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "urgency" TEXT,
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
INSERT INTO "new_Chaser" ("completedAt", "contactEmail", "contactName", "contactPhone", "createdAt", "currentAttempt", "customerId", "documents", "id", "maxAttempts", "name", "nextOutreachAt", "status", "updatedAt", "urgency", "who") SELECT "completedAt", "contactEmail", "contactName", "contactPhone", "createdAt", "currentAttempt", "customerId", "documents", "id", "maxAttempts", "name", "nextOutreachAt", "status", "updatedAt", "urgency", "who" FROM "Chaser";
DROP TABLE "Chaser";
ALTER TABLE "new_Chaser" RENAME TO "Chaser";
CREATE INDEX "Chaser_customerId_idx" ON "Chaser"("customerId");
CREATE INDEX "Chaser_status_idx" ON "Chaser"("status");
CREATE INDEX "Chaser_dueDate_idx" ON "Chaser"("dueDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
