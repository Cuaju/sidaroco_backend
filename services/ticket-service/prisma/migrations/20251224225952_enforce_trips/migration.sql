ALTER TABLE "tickets"
ALTER COLUMN "trip_id" SET NOT NULL,
ALTER COLUMN "seat_number" SET NOT NULL;

ALTER TABLE "tickets"
ADD CONSTRAINT "unique_seat_per_trip"
UNIQUE ("trip_id", "seat_number");
