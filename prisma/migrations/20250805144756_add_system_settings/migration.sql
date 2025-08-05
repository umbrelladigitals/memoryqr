-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maxImageSizeMB" INTEGER NOT NULL DEFAULT 10,
    "maxVideoSizeMB" INTEGER NOT NULL DEFAULT 100,
    "allowedImageFormats" TEXT NOT NULL DEFAULT 'jpg,jpeg,png,gif,webp',
    "allowedVideoFormats" TEXT NOT NULL DEFAULT 'mp4,mov,avi,mkv,webm,m4v',
    "maxUploadsPerEvent" INTEGER NOT NULL DEFAULT 100,
    "autoDeleteAfterDays" INTEGER,
    "enableVideoUploads" BOOLEAN NOT NULL DEFAULT true,
    "enableImageUploads" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
