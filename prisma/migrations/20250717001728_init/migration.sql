/*
  Warnings:

  - You are about to drop the column `maxEvents` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `maxStorageGB` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `maxUploadsPerEvent` on the `subscriptions` table. All the data in the column will be lost.
  - Made the column `planId` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_planId_fkey";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "maxEvents",
DROP COLUMN "maxStorageGB",
DROP COLUMN "maxUploadsPerEvent",
ALTER COLUMN "planId" SET NOT NULL;

-- DropEnum
DROP TYPE "PlanType";

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
