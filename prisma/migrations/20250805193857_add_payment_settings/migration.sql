-- CreateTable
CREATE TABLE "payment_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bankName" TEXT NOT NULL DEFAULT '',
    "bankAccountName" TEXT NOT NULL DEFAULT '',
    "bankAccountNumber" TEXT NOT NULL DEFAULT '',
    "bankIban" TEXT NOT NULL DEFAULT '',
    "bankSwiftCode" TEXT NOT NULL DEFAULT '',
    "bankBranch" TEXT NOT NULL DEFAULT '',
    "paymentInstructions" TEXT NOT NULL DEFAULT 'Havale/EFT yaparken açıklama kısmına sipariş numaranızı yazınız. Ödemeniz onaylandıktan sonra planınız aktif edilecektir.',
    "autoApprovalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "manualApprovalRequired" BOOLEAN NOT NULL DEFAULT true,
    "paymentTimeoutHours" INTEGER NOT NULL DEFAULT 24,
    "creditCardEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paypalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "cryptoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_site_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'Snaprella',
    "siteDescription" TEXT NOT NULL DEFAULT 'QR Kod ile Anı Paylaşım Platformu',
    "siteUrl" TEXT NOT NULL DEFAULT 'https://snaprella.com',
    "adminEmail" TEXT NOT NULL DEFAULT 'admin@snaprella.com',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@snaprella.com',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "language" TEXT NOT NULL DEFAULT 'tr',
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "logo" TEXT,
    "favicon" TEXT,
    "appleTouchIcon" TEXT,
    "ogImage" TEXT,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "youtubeUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "googleAnalyticsId" TEXT,
    "googleSiteVerification" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPassword" TEXT,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
    "emailFromName" TEXT NOT NULL DEFAULT 'Snaprella',
    "emailFromAddress" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "userRegistration" BOOLEAN NOT NULL DEFAULT true,
    "emailVerification" BOOLEAN NOT NULL DEFAULT true,
    "socialLogin" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "stripePublishableKey" TEXT,
    "stripeSecretKey" TEXT,
    "paypalClientId" TEXT,
    "paypalClientSecret" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#10B981',
    "accentColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "textColor" TEXT NOT NULL DEFAULT '#1F2937',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_site_settings" ("accentColor", "adminEmail", "appleTouchIcon", "backgroundColor", "createdAt", "currency", "emailFromAddress", "emailFromName", "emailNotifications", "emailVerification", "facebookUrl", "favicon", "googleAnalyticsId", "googleSiteVerification", "id", "instagramUrl", "language", "linkedinUrl", "logo", "maintenanceMessage", "maintenanceMode", "metaDescription", "metaKeywords", "metaTitle", "ogImage", "paypalClientId", "paypalClientSecret", "primaryColor", "pushNotifications", "secondaryColor", "siteDescription", "siteName", "siteUrl", "smsNotifications", "smtpHost", "smtpPassword", "smtpPort", "smtpSecure", "smtpUser", "socialLogin", "stripePublishableKey", "stripeSecretKey", "supportEmail", "textColor", "timezone", "twitterUrl", "updatedAt", "userRegistration", "youtubeUrl") SELECT "accentColor", "adminEmail", "appleTouchIcon", "backgroundColor", "createdAt", "currency", "emailFromAddress", "emailFromName", "emailNotifications", "emailVerification", "facebookUrl", "favicon", "googleAnalyticsId", "googleSiteVerification", "id", "instagramUrl", "language", "linkedinUrl", "logo", "maintenanceMessage", "maintenanceMode", "metaDescription", "metaKeywords", "metaTitle", "ogImage", "paypalClientId", "paypalClientSecret", "primaryColor", "pushNotifications", "secondaryColor", "siteDescription", "siteName", "siteUrl", "smsNotifications", "smtpHost", "smtpPassword", "smtpPort", "smtpSecure", "smtpUser", "socialLogin", "stripePublishableKey", "stripeSecretKey", "supportEmail", "textColor", "timezone", "twitterUrl", "updatedAt", "userRegistration", "youtubeUrl" FROM "site_settings";
DROP TABLE "site_settings";
ALTER TABLE "new_site_settings" RENAME TO "site_settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
