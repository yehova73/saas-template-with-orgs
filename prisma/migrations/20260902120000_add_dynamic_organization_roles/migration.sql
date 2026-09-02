-- CreateTable
CREATE TABLE "OrganizationUserRole" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manageSettings" BOOLEAN NOT NULL DEFAULT false,
    "manageBilling" BOOLEAN NOT NULL DEFAULT false,
    "manageMembers" BOOLEAN NOT NULL DEFAULT false,
    "createProject" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationUserRole_pkey" PRIMARY KEY ("id")
);

-- Add temporary role references for backfilling existing memberships and invites
ALTER TABLE "OrganizationMembership" ADD COLUMN "roleId" TEXT;
ALTER TABLE "OrganizationInvite" ADD COLUMN "roleId" TEXT;

-- Seed one equivalent dynamic role set for every existing organization
INSERT INTO "OrganizationUserRole" ("id", "organizationId", "name", "manageSettings", "manageBilling", "manageMembers", "createProject")
SELECT 'role_owner_' || "id", "id", 'Owner', true, true, true, true FROM "Organization";
INSERT INTO "OrganizationUserRole" ("id", "organizationId", "name", "manageSettings", "manageBilling", "manageMembers", "createProject")
SELECT 'role_admin_' || "id", "id", 'Admin', true, false, true, true FROM "Organization";
INSERT INTO "OrganizationUserRole" ("id", "organizationId", "name", "manageSettings", "manageBilling", "manageMembers", "createProject")
SELECT 'role_member_' || "id", "id", 'Member', false, false, false, false FROM "Organization";

UPDATE "OrganizationMembership" AS membership
SET "roleId" = CASE membership."role"::text
    WHEN 'CREATOR' THEN 'role_owner_' || membership."organizationId"
    WHEN 'ADMIN' THEN 'role_admin_' || membership."organizationId"
    ELSE 'role_member_' || membership."organizationId"
END;
UPDATE "OrganizationInvite" AS invite
SET "roleId" = CASE invite."role"::text
    WHEN 'CREATOR' THEN 'role_owner_' || invite."organizationId"
    WHEN 'ADMIN' THEN 'role_admin_' || invite."organizationId"
    ELSE 'role_member_' || invite."organizationId"
END;

ALTER TABLE "OrganizationMembership" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "OrganizationInvite" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "OrganizationMembership" DROP COLUMN "role";
ALTER TABLE "OrganizationInvite" DROP COLUMN "role";
DROP TYPE "OrganizationRole";

-- CreateIndex
CREATE INDEX "OrganizationUserRole_organizationId_idx" ON "OrganizationUserRole"("organizationId");
CREATE UNIQUE INDEX "OrganizationUserRole_organizationId_name_key" ON "OrganizationUserRole"("organizationId", "name");
CREATE INDEX "OrganizationMembership_roleId_idx" ON "OrganizationMembership"("roleId");
CREATE INDEX "OrganizationInvite_roleId_idx" ON "OrganizationInvite"("roleId");

-- AddForeignKey
ALTER TABLE "OrganizationUserRole" ADD CONSTRAINT "OrganizationUserRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationUserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationUserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
