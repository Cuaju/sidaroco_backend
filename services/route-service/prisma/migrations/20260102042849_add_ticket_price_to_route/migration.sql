-- DropIndex
DROP INDEX "Route_originId_destinationId_key";

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "ticketPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00;
