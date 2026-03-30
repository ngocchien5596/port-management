/*
  Warnings:

  - The `status` column on the `Voyage` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VoyageStatus" AS ENUM ('THU_TUC', 'DO_MON_DAU_VAO', 'LAY_MAU', 'LAM_HANG', 'DO_MON_DAU_RA', 'HOAN_THANH', 'TAM_DUNG', 'HUY_BO');

-- AlterTable
ALTER TABLE "Voyage" DROP COLUMN "status",
ADD COLUMN     "status" "VoyageStatus" NOT NULL DEFAULT 'THU_TUC';

-- AlterTable
ALTER TABLE "VoyageProgress" ADD COLUMN     "hours" DECIMAL(65,30),
ADD COLUMN     "productivity" DECIMAL(65,30);

-- CreateIndex
CREATE INDEX "Voyage_laneId_status_idx" ON "Voyage"("laneId", "status");
