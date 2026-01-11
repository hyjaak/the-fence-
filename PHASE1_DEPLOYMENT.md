# PHASE 1 DEPLOYMENT INSTRUCTIONS

## ✅ COMPLETED (Already Deployed)
- Enhanced AuditLog schema with new fields
- Created audit logging system (never throws, never breaks requests)
- Instrumented all auth routes (login, logout)
- Instrumented all action routes (execute, modify-config, override-guard, deploy-change)
- Added graceful degradation (READ_ONLY mode if database unavailable)
- Enhanced health check with latency tracking

## 🔧 DATABASE MIGRATION REQUIRED

**Run this SQL in Supabase SQL Editor:**

Location: `web/prisma/migrations/add_audit_log_fields.sql`

```sql
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
```

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Paste the SQL above
3. Click "Run"
4. Verify the verification query shows all new columns

## 📊 WHAT'S NOW LOGGED

Every action is safely logged to AuditLog table:
- **LOGIN_SUCCESS** - Successful authentication
- **LOGIN_FAILED** - Failed login attempts
- **LOGIN_ERROR** - Unexpected login errors
- **LOGOUT** - User logout
- **EXECUTE_ACTION_REQUEST** - Action execution attempts
- **CONFIG_MODIFY_REQUEST** - Configuration changes
- **OVERRIDE_GUARD_REQUEST** - Guardrail overrides
- **DEPLOY_CHANGE_REQUEST** - Deployment requests

Each log includes:
- Actor role (ADMIN/OPERATOR/SYSTEM/UNKNOWN)
- Actor username
- Status (SUCCESS/FAIL)
- IP address (from x-forwarded-for)
- User agent
- Metadata (JSON)

## 🛡️ GRACEFUL DEGRADATION

Dashboard now handles database failures:
- Returns status 200 (not 500) even if DB is down
- Shows "READ_ONLY" mode banner
- Displays safe fallback data
- Never shows white screen/error page

## 🏥 ENHANCED HEALTH CHECK

`GET /api/health` now returns:
```json
{
  "ok": true,
  "timestamp": "2026-01-11T...",
  "build": "abc123",
  "db": {
    "connected": true,
    "latencyMs": 45
  },
  ...
}
```

## 🧪 TESTING CHECKLIST

- [ ] Run database migration in Supabase
- [ ] Login works (check Supabase AuditLog table for LOGIN_SUCCESS)
- [ ] Failed login creates LOGIN_FAILED entry
- [ ] Logout creates LOGOUT entry
- [ ] Action buttons create audit entries
- [ ] Dashboard loads (even with DB issues)
- [ ] /api/health shows latency and build info

## 🔐 SECURITY NOTES

- Audit logging is fail-safe (never throws)
- No secrets logged to audit table
- IP extraction handles Vercel/Cloudflare headers
- All routes remain backward compatible
- No breaking changes to authentication flow
