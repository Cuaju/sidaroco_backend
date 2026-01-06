/*
  Warnings:

  - A unique constraint covering the columns `[mapboxId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fullName` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mapboxId` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Location_name_lat_lng_key";

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "mapboxId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Location_mapboxId_key" ON "Location"("mapboxId");
