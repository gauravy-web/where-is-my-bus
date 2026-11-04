-- Add absenceReason field to Attendance table
-- This allows drivers to record why a student didn't board with predefined reasons

ALTER TABLE "Attendance" ADD COLUMN "absenceReason" TEXT;

-- Add index for querying attendance with reasons
CREATE INDEX "Attendance_absenceReason_idx" ON "Attendance"("absenceReason") WHERE "absenceReason" IS NOT NULL;
