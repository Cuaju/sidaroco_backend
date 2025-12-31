-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('scheduled', 'canceled', 'completed');

-- CreateTable
CREATE TABLE "daily_schedules" (
    "id" SERIAL NOT NULL,
    "serviceDate" DATE NOT NULL,
    "duplicatedFrom" DATE,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_trips" (
    "id" SERIAL NOT NULL,
    "dailyScheduleId" INTEGER NOT NULL,
    "routeId" INTEGER NOT NULL,
    "busId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "departureTime" TIME NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_trips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_schedules_serviceDate_key" ON "daily_schedules"("serviceDate");

-- CreateIndex
CREATE INDEX "scheduled_trips_dailyScheduleId_idx" ON "scheduled_trips"("dailyScheduleId");

-- CreateIndex
CREATE INDEX "scheduled_trips_routeId_idx" ON "scheduled_trips"("routeId");

-- CreateIndex
CREATE INDEX "scheduled_trips_busId_idx" ON "scheduled_trips"("busId");

-- CreateIndex
CREATE INDEX "scheduled_trips_driverId_idx" ON "scheduled_trips"("driverId");

-- AddForeignKey
ALTER TABLE "scheduled_trips" ADD CONSTRAINT "scheduled_trips_dailyScheduleId_fkey" FOREIGN KEY ("dailyScheduleId") REFERENCES "daily_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
