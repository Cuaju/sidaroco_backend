-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drivers_license_number_key" ON "drivers"("license_number");
