-- Additive: GPS device management. No existing data is touched.
CREATE TYPE "LocationMode" AS ENUM ('MOBILE_PRIMARY', 'DEVICE_PRIMARY');
CREATE TYPE "LocationSource" AS ENUM ('MOBILE', 'DEVICE', 'NONE');

ALTER TABLE "Bus" ADD COLUMN "locationMode" "LocationMode" NOT NULL DEFAULT 'MOBILE_PRIMARY';
ALTER TABLE "Bus" ADD COLUMN "activeSource" "LocationSource" NOT NULL DEFAULT 'MOBILE';
ALTER TABLE "Bus" ADD COLUMN "sourceChangedAt" TIMESTAMP(6);

CREATE TABLE "GpsDevice" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "deviceId" TEXT NOT NULL,
    "name" TEXT,
    "busId" TEXT,
    "credentialHash" TEXT NOT NULL,
    "credentialIssuedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(6),
    "verifiedAt" TIMESTAMP(6),
    "validFixCount" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(6),
    "lastFixAt" TIMESTAMP(6),
    "lastLat" DOUBLE PRECISION,
    "lastLng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GpsDevice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GpsDevice_deviceId_key" ON "GpsDevice"("deviceId");
CREATE UNIQUE INDEX "GpsDevice_busId_key" ON "GpsDevice"("busId");
