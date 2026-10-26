-- CreateEnum
CREATE TYPE "TripDirection" AS ENUM ('PICKUP', 'DROP');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TripStopStatus" AS ENUM ('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Bus" ADD COLUMN     "label" TEXT;

-- AlterTable
ALTER TABLE "Stop" ADD COLUMN     "direction" "TripDirection" NOT NULL DEFAULT 'PICKUP',
ADD COLUMN     "studentId" TEXT;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "contactPhone" TEXT;

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "checkedAt" TIMESTAMP(6),
ADD COLUMN     "conductorId" TEXT,
ADD COLUMN     "tripId" TEXT,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "dropStopId" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "parentPhone2" TEXT;

-- CreateTable
CREATE TABLE "Conductor" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "busId" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conductor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "busId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "direction" "TripDirection" NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(6),
    "lastLat" DOUBLE PRECISION,
    "lastLng" DOUBLE PRECISION,
    "lastSpeed" DOUBLE PRECISION,
    "lastHeading" DOUBLE PRECISION,
    "lastLocationAt" TIMESTAMP(6),
    "destName" TEXT,
    "destLat" DOUBLE PRECISION,
    "destLng" DOUBLE PRECISION,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripStop" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tripId" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "status" "TripStopStatus" NOT NULL DEFAULT 'PENDING',
    "arrivedAt" TIMESTAMP(6),
    "completedAt" TIMESTAMP(6),

    CONSTRAINT "TripStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tripId" TEXT NOT NULL,
    "tripStopId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "etaSeconds" INTEGER,
    "sentAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trip_busId_status_idx" ON "Trip"("busId", "status");

-- CreateIndex
CREATE INDEX "TripStop_tripId_order_idx" ON "TripStop"("tripId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_tripId_tripStopId_studentId_type_key" ON "NotificationLog"("tripId", "tripStopId", "studentId", "type");

-- CreateIndex
CREATE INDEX "Stop_busId_direction_order_idx" ON "Stop"("busId", "direction", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_tripId_studentId_type_key" ON "Attendance"("tripId", "studentId", "type");

-- CreateIndex
CREATE INDEX "Student_admissionNo_idx" ON "Student"("admissionNo");

-- AddForeignKey
ALTER TABLE "TripStop" ADD CONSTRAINT "TripStop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

