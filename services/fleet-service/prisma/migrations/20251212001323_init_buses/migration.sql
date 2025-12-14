-- CreateTable
CREATE TABLE "buses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "route_id" INTEGER,

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buses_vin_key" ON "buses"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "buses_plate_number_key" ON "buses"("plate_number");
