/*
  Warnings:

  - You are about to drop the column `defaultProductivity` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `SystemConfig` table. All the data in the column will be lost.
  - You are about to drop the `CargoType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EquipmentToCargoType` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "IncidentScope" AS ENUM ('GLOBAL', 'LANE', 'EQUIPMENT', 'VOYAGE');

-- AlterEnum
ALTER TYPE "VoyageStatus" ADD VALUE 'NHAP';

-- DropForeignKey
ALTER TABLE "Incident" DROP CONSTRAINT "Incident_voyageId_fkey";

-- DropForeignKey
ALTER TABLE "_EquipmentToCargoType" DROP CONSTRAINT "_EquipmentToCargoType_A_fkey";

-- DropForeignKey
ALTER TABLE "_EquipmentToCargoType" DROP CONSTRAINT "_EquipmentToCargoType_B_fkey";

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "capacity" DECIMAL(65,30) DEFAULT 100,
ADD COLUMN     "manualStatus" TEXT;

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "equipmentId" TEXT,
ADD COLUMN     "laneId" TEXT,
ADD COLUMN     "scope" "IncidentScope" NOT NULL DEFAULT 'VOYAGE',
ALTER COLUMN "voyageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "defaultProductivity";

-- AlterTable
ALTER TABLE "SystemConfig" DROP COLUMN "updatedBy";

-- AlterTable
ALTER TABLE "Vessel" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Voyage" ADD COLUMN     "equipmentId" TEXT,
ADD COLUMN     "procedureTimeHours" DECIMAL(65,30) DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'NHAP';

-- AlterTable
ALTER TABLE "VoyageProgress" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "CargoType";

-- DropTable
DROP TABLE "_EquipmentToCargoType";

-- CreateTable
CREATE TABLE "EquipmentEvent" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EquipmentToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EquipmentToProduct_AB_unique" ON "_EquipmentToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_EquipmentToProduct_B_index" ON "_EquipmentToProduct"("B");

-- AddForeignKey
ALTER TABLE "EquipmentEvent" ADD CONSTRAINT "EquipmentEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentEvent" ADD CONSTRAINT "EquipmentEvent_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voyage" ADD CONSTRAINT "Voyage_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "Voyage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_laneId_fkey" FOREIGN KEY ("laneId") REFERENCES "Lane"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoyageEvent" ADD CONSTRAINT "VoyageEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoyageProgress" ADD CONSTRAINT "VoyageProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoyageProgress" ADD CONSTRAINT "VoyageProgress_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToProduct" ADD CONSTRAINT "_EquipmentToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToProduct" ADD CONSTRAINT "_EquipmentToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
