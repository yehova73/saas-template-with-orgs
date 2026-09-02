-- AlterEnum
ALTER TYPE "OrganizationRole" ADD VALUE 'CREATOR';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organizationsCreated" INTEGER NOT NULL DEFAULT 0;
