-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photo_key" TEXT;
