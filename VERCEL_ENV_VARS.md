# Vercel Environment Variables Checklist

## ✅ REQUIRED - Set These in Vercel Dashboard

Go to: **Project Settings → Environment Variables**

### Database Connection (Supabase)

```bash
# Transaction pooler URL (port 6543) - for runtime queries
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection URL (port 5432) - for migrations and Prisma introspection
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

**Replace:**
- `[PROJECT_REF]` with your Supabase project reference (e.g., `itarkoqfrddjgespxpjh`)
- `[PASSWORD]` with your Supabase database password
- `[REGION]` with your region (e.g., `us-east-1`)

### Authentication

```bash
# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here

# Operator credentials
OPERATOR_USERNAME=operator
OPERATOR_PASSWORD=your-operator-password-here

# Session secret (generate random string)
FENCE_SESSION_SECRET=generate-random-32-char-string-here
```

### Optional Build Info

```bash
# Automatically set by Vercel
VERCEL_GIT_COMMIT_SHA=<auto>
NODE_ENV=production
```

---

## 🔍 How to Get Your Supabase URLs

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** → **Database**
3. Scroll to **Connection string**
4. Copy **Connection pooling** URL (for `DATABASE_URL`)
5. Change port from `6543` to `5432` for `DIRECT_URL`

**Example:**
```
Pooler URL:  postgresql://postgres.abc123:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres
Direct URL:  postgresql://postgres.abc123:pass@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## 🧪 Testing After Setting Env Vars

1. **Redeploy** (Settings → Deployments → ⋯ → Redeploy)
2. **Check health endpoint**: `https://your-domain.vercel.app/api/health`
   - Should return: `{ "ok": true, "db": { "connected": true, "latencyMs": <number> } }`
3. **Test login**: Should work without "Internal server error"
4. **View dashboard**: Should show live data, NOT read-only mode
5. **Test actions**: Execute action should create audit log entry

---

## 🚨 Troubleshooting

### Error: "DATABASE_URL environment variable not set"
- ✅ Set `DATABASE_URL` in Vercel env vars
- ✅ Redeploy after adding env vars

### Error: "Can't reach database server"
- ❌ Wrong URL format
- ❌ Wrong password
- ❌ Supabase project paused (free tier)
- ✅ Check Supabase is active
- ✅ Verify password is correct

### Dashboard shows "READ-ONLY MODE"
- ❌ Database not responding
- ❌ Wrong connection string
- ✅ Check `/api/health` endpoint for error details
- ✅ Verify `DATABASE_URL` uses port `6543` (pooler)
- ✅ Verify `DIRECT_URL` uses port `5432` (direct)

### Login fails with 500 error
- ❌ Missing `ADMIN_USERNAME` or `ADMIN_PASSWORD`
- ✅ Set all authentication env vars
- ✅ Check Vercel function logs for details

---

## 📋 Quick Copy-Paste Template

```bash
# Database
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres

# Auth
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeMe123!
OPERATOR_USERNAME=operator
OPERATOR_PASSWORD=ChangeMe456!
FENCE_SESSION_SECRET=random-32-char-secret-generate-with-openssl
```

**Generate session secret:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32
