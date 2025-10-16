-- CreateTable
CREATE TABLE "DocumentItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chaserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "receivedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "DocumentItem_chaserId_fkey" FOREIGN KEY ("chaserId") REFERENCES "Chaser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DocumentItem_chaserId_idx" ON "DocumentItem"("chaserId");

-- CreateIndex
CREATE INDEX "DocumentItem_status_idx" ON "DocumentItem"("status");
