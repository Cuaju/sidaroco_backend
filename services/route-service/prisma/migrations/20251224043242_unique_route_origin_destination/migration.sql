/*
  Warnings:

  - A unique constraint covering the columns `[originId,destinationId]` on the table `Route` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Route_destinationId_idx";

-- DropIndex
DROP INDEX "Route_originId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Route_originId_destinationId_key" ON "Route"("originId", "destinationId");
