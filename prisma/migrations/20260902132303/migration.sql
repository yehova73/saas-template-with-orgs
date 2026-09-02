-- AlterTable
ALTER TABLE "OrganizationInvite" ADD COLUMN     "projectId" TEXT;

-- CreateIndex
CREATE INDEX "OrganizationInvite_projectId_idx" ON "OrganizationInvite"("projectId");

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
