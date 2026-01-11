-- Migration: Add audit log fields
-- Run this in Supabase SQL Editor

-- Add new columns to AuditLog table
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "actorRole" TEXT NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "actorUsername" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'SUCCESS';
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "meta" JSONB;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_actorRole_idx" ON "AuditLog"("actorRole");

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'AuditLog'
ORDER BY ordinal_position;
