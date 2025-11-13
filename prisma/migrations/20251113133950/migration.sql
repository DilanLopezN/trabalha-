-- AlterTable
ALTER TABLE "Vaga" ADD COLUMN     "isPaidAd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAdExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Vaga_isPaidAd_idx" ON "Vaga"("isPaidAd");
