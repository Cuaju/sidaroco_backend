-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- RenameIndex
ALTER INDEX "unique_seat_per_trip" RENAME TO "tickets_trip_id_seat_number_key";
