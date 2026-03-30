/*
  Warnings:

  - You are about to drop the column `departmentId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `positionId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Position` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CargoCategory" AS ENUM ('IMPORT', 'EXPORT');

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_positionId_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "departmentId",
DROP COLUMN "positionId";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "Position";

-- CreateTable
CREATE TABLE "CargoType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "CargoCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CargoType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lane" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "laneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EquipmentToCargoType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CargoType_name_key" ON "CargoType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lane_name_key" ON "Lane"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_name_key" ON "Equipment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_EquipmentToCargoType_AB_unique" ON "_EquipmentToCargoType"("A", "B");

-- CreateIndex
CREATE INDEX "_EquipmentToCargoType_B_index" ON "_EquipmentToCargoType"("B");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_laneId_fkey" FOREIGN KEY ("laneId") REFERENCES "Lane"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToCargoType" ADD CONSTRAINT "_EquipmentToCargoType_A_fkey" FOREIGN KEY ("A") REFERENCES "CargoType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToCargoType" ADD CONSTRAINT "_EquipmentToCargoType_B_fkey" FOREIGN KEY ("B") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
