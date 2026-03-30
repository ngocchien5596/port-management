-- AlterTable
ALTER TABLE "Voyage" ADD COLUMN     "laneId" TEXT;

-- CreateIndex
CREATE INDEX "Voyage_laneId_status_idx" ON "Voyage"("laneId", "status");

-- AddForeignKey
ALTER TABLE "Voyage" ADD CONSTRAINT "Voyage_laneId_fkey" FOREIGN KEY ("laneId") REFERENCES "Lane"("id") ON DELETE SET NULL ON UPDATE CASCADE;
