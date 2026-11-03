-- CreateEnum
CREATE TYPE "AbsenceStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'LATE');

-- CreateTable
CREATE TABLE "AbsenceNotification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "studentId" TEXT NOT NULL,
    "parentUserId" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "tripId" TEXT,
    "stopId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT,
    "status" "AbsenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(6),

    CONSTRAINT "AbsenceNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AbsenceNotification_busId_date_idx" ON "AbsenceNotification"("busId", "date");

-- CreateIndex
CREATE INDEX "AbsenceNotification_studentId_date_idx" ON "AbsenceNotification"("studentId", "date");

-- CreateIndex
CREATE INDEX "AbsenceNotification_tripId_idx" ON "AbsenceNotification"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "AbsenceNotification_studentId_busId_date_key" ON "AbsenceNotification"("studentId", "busId", "date");

-- AddForeignKey
ALTER TABLE "AbsenceNotification" ADD CONSTRAINT "AbsenceNotification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenceNotification" ADD CONSTRAINT "AbsenceNotification_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
