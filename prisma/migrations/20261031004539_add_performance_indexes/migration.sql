-- Add composite indexes for performance optimization

CREATE INDEX IF NOT EXISTS "Student_busId_parentPhone_idx" ON "Student"("busId", "parentPhone");
CREATE INDEX IF NOT EXISTS "Student_busId_stopId_idx" ON "Student"("busId", "stopId");
CREATE INDEX IF NOT EXISTS "LiveLocation_busId_timestamp_idx" ON "LiveLocation"("busId", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "Attendance_busId_date_tripType_idx" ON "Attendance"("busId", "date", "tripType");
CREATE INDEX IF NOT EXISTS "Emergency_status_createdAt_idx" ON "Emergency"("status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "Driver_busId_idx" ON "Driver"("busId");
CREATE INDEX IF NOT EXISTS "Bus_status_idx" ON "Bus"("status");