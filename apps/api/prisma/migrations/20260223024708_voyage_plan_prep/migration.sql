-- AlterTable
ALTER TABLE "Voyage" ADD COLUMN     "cancelReason" TEXT;

-- AlterTable
ALTER TABLE "VoyageProgress" ADD COLUMN     "shiftId" TEXT;

-- AddForeignKey
ALTER TABLE "VoyageProgress" ADD CONSTRAINT "VoyageProgress_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
