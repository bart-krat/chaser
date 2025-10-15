-- CreateTable
CREATE TABLE "Chaser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "task" TEXT NOT NULL,
    "documents" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL,
    "currentAttempt" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "nextOutreachAt" DATETIME,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "OutreachSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chaserId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "medium" TEXT NOT NULL,
    "scheduledFor" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "sentAt" DATETIME,
    "deliveredAt" DATETIME,
    "responseReceived" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    CONSTRAINT "OutreachSchedule_chaserId_fkey" FOREIGN KEY ("chaserId") REFERENCES "Chaser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "OutreachSchedule_chaserId_idx" ON "OutreachSchedule"("chaserId");

-- CreateIndex
CREATE INDEX "OutreachSchedule_scheduledFor_status_idx" ON "OutreachSchedule"("scheduledFor", "status");
