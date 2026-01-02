/*
  Warnings:

  - You are about to alter the column `ticketPrice` on the `Route` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - A unique constraint covering the columns `[originId,destinationId]` on the table `Route` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Route" ALTER COLUMN "ticketPrice" DROP NOT NULL,
ALTER COLUMN "ticketPrice" DROP DEFAULT,
ALTER COLUMN "ticketPrice" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Route_originId_destinationId_key" ON "Route"("originId", "destinationId");
