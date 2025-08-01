-- AlterTable
ALTER TABLE "events" ADD COLUMN     "customColors" JSONB,
ADD COLUMN     "customLogo" TEXT,
ADD COLUMN     "customMessage" TEXT,
ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "upload_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "previewImage" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "backgroundColor" TEXT NOT NULL DEFAULT '#F8FAFC',
    "textColor" TEXT NOT NULL DEFAULT '#1F2937',
    "headerStyle" TEXT NOT NULL DEFAULT 'minimal',
    "buttonStyle" TEXT NOT NULL DEFAULT 'rounded',
    "cardStyle" TEXT NOT NULL DEFAULT 'shadow',
    "welcomeTitle" TEXT NOT NULL DEFAULT 'Fotoğraflarınızı Paylaşın',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Etkinlik anılarınızı bizimle paylaşın! Fotoğraflarınızı yüklemek için aşağıdaki butona tıklayın.',
    "uploadButtonText" TEXT NOT NULL DEFAULT 'Fotoğraf Yükle',
    "customCSS" TEXT,
    "animations" JSONB,
    "layout" JSONB,
    "fonts" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upload_templates_name_key" ON "upload_templates"("name");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "upload_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
