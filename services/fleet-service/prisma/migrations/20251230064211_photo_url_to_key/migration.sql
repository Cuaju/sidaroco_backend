/*
  Warnings:

  - You are about to drop the column `photo_url` on the `buses` table. All the data in the column will be lost.
  - You are about to drop the column `photo_url` on the `drivers` table. All the data in the column will be lost.
  - Added the required column `photo_key` to the `buses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photo_key` to the `drivers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "buses" DROP COLUMN "photo_url",
ADD COLUMN     "photo_key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "photo_url",
ADD COLUMN     "photo_key" TEXT NOT NULL;
