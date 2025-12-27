CREATE TABLE "trips" (
  "id" SERIAL NOT NULL,
  "route_id" INTEGER NOT NULL,
  "departure_time" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "tickets"
ADD COLUMN "trip_id" INTEGER,
ADD COLUMN "seat_number" INTEGER;

ALTER TABLE "tickets"
DROP COLUMN "route_id";
