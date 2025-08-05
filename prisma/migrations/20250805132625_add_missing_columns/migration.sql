/*
  Warnings:

  - You are about to drop the `photo_analyses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `smart_albums` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `social_shares` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `templateId` on the `events` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "photo_analyses_uploadId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "photo_analyses";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "smart_albums";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "social_shares";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "qrCode" TEXT NOT NULL,
    "maxUploads" INTEGER,
    "autoArchive" BOOLEAN NOT NULL DEFAULT true,
    "archiveDate" DATETIME,
    "eventType" TEXT,
    "participants" JSONB,
    "customColors" JSONB,
    "customLogo" TEXT,
    "customStyles" JSONB,
    "customMessage" TEXT,
    "bannerImage" TEXT,
    "selectedTemplate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customerId" TEXT NOT NULL,
    CONSTRAINT "events_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_events" ("archiveDate", "autoArchive", "bannerImage", "createdAt", "customColors", "customLogo", "customMessage", "customStyles", "customerId", "date", "description", "id", "isActive", "location", "maxUploads", "qrCode", "selectedTemplate", "title", "updatedAt") SELECT "archiveDate", "autoArchive", "bannerImage", "createdAt", "customColors", "customLogo", "customMessage", "customStyles", "customerId", "date", "description", "id", "isActive", "location", "maxUploads", "qrCode", "selectedTemplate", "title", "updatedAt" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE UNIQUE INDEX "events_qrCode_key" ON "events"("qrCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
