/*
  Warnings:

  - The values [FREE] on the enum `SubscriptionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `autoSnapshotsAccess` on the `OrganizationFeatureAccess` table. All the data in the column will be lost.
  - You are about to drop the column `groupsAccess` on the `OrganizationFeatureAccess` table. All the data in the column will be lost.
  - You are about to drop the column `snapshotDaysRetention` on the `OrganizationFeatureAccess` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceDashboardPageAccess` on the `OrganizationFeatureAccess` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceLinksLimit` on the `OrganizationFeatureAccess` table. All the data in the column will be lost.
  - You are about to drop the column `workspacesLimit` on the `OrganizationFeatureAccess` table. All the data in the column will be lost.
  - You are about to drop the `UserFeatureAccess` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionType_new" AS ENUM ('STARTER', 'PRO', 'ULTIMATE');
ALTER TABLE "Subscription" ALTER COLUMN "type" TYPE "SubscriptionType_new" USING ("type"::text::"SubscriptionType_new");
ALTER TYPE "SubscriptionType" RENAME TO "SubscriptionType_old";
ALTER TYPE "SubscriptionType_new" RENAME TO "SubscriptionType";
DROP TYPE "public"."SubscriptionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "UserFeatureAccess" DROP CONSTRAINT "UserFeatureAccess_userId_fkey";

-- AlterTable
ALTER TABLE "OrganizationFeatureAccess" DROP COLUMN "autoSnapshotsAccess",
DROP COLUMN "groupsAccess",
DROP COLUMN "snapshotDaysRetention",
DROP COLUMN "workspaceDashboardPageAccess",
DROP COLUMN "workspaceLinksLimit",
DROP COLUMN "workspacesLimit",
ADD COLUMN     "membersLimit" INTEGER DEFAULT 5,
ADD COLUMN     "projectsLimit" INTEGER DEFAULT 3;

-- DropTable
DROP TABLE "UserFeatureAccess";
