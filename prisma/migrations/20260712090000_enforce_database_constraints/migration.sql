-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_employeeId_fkey";

-- DropIndex
DROP INDEX "User_employeeId_key";

-- CreateIndex
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_id_email_key" UNIQUE ("id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_email_key" ON "User"("employeeId", "email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_email_fkey" FOREIGN KEY ("employeeId", "email") REFERENCES "Employee"("id", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateUniqueIndex for double-allocation prevention
CREATE UNIQUE INDEX "AssetAllocation_active_asset_unique" ON "AssetAllocation"("assetId") WHERE status = 'ACTIVE' AND "isDeleted" = false;

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- CreateExclusionConstraint for booking overlap prevention
ALTER TABLE "ResourceBooking" ADD CONSTRAINT "ResourceBooking_overlap_exclude" EXCLUDE USING gist (
  "assetId" WITH =,
  tsrange("startTime", "endTime") WITH &&
) WHERE (status IN ('UPCOMING', 'ONGOING') AND "isDeleted" = false);
