-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "amount_received" DOUBLE PRECISION,
ADD COLUMN     "card_last4" TEXT,
ADD COLUMN     "change_given" DOUBLE PRECISION;
