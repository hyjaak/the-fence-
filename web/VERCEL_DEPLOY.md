# VERCEL DEPLOYMENT GUIDE

## Prerequisites
- Supabase project created
- Database password: `m3dPfdfYeZ4xPwk5`
- Project ref: `wxtbofrwrrpnsimjced`

## Vercel Environment Variables

Add to Vercel Project Settings → Environment Variables:

### Required Variable

**Name**: `DATABASE_URL`

**Value**:
```
postgresql://postgres.wxtbofrwrrpnsimjced:m3dPfdfYeZ4xPwk5@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Apply to**:
- ✅ Production
- ✅ Preview
- ⚪ Development (optional)

### Optional Variable

**Name**: `FENCE_SESSION_SECRET`

**Value**: (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

**Apply to**: All environments

## Deployment Steps

### 1. Commit Changes
```bash
cd web
git add .
git commit -m "Configure Vercel deployment with Prisma migrations"
git push
```

### 2. Deploy to Vercel

**Option A - Via Dashboard**:
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import GitHub repository
4. Set **Root Directory**: `web`
5. Add environment variable `DATABASE_URL`
6. Click "Deploy"

**Option B - Via CLI**:
```bash
cd web
npx vercel
# Follow prompts
```

### 3. Verify Build Logs

Check Vercel deployment logs for:
```
✓ Running postinstall...
  ✓ Generated Prisma Client
✓ Running migrate:deploy...
  ✓ Applied migration 20260109061747_db_layer_expand
✓ Building Next.js...
```

### 4. Test Deployment

Visit your Vercel URL:
- `/login` → Should load
- Login with `admin` / `admin123`
- `/dashboard` → Should display data from Supabase

## Build Pipeline

The build process runs automatically in this order:

1. **`npm install`** → Installs dependencies
2. **`postinstall`** → `prisma generate` → Generates Prisma Client
3. **`npm run build`** →
   - `npm run migrate:deploy` → Applies pending migrations to Supabase
   - `next build` → Builds Next.js app

## Local Development

**Database operations are DISABLED locally** due to network restrictions.

- Dev server: `npm run dev` (UI only, no DB access)
- Database changes: Deploy to Vercel to test

## Troubleshooting

### Build fails with "Can't reach database server"
- Verify `DATABASE_URL` is set in Vercel environment variables
- Check database password is correct
- Ensure using Session Pooler (port 5432)

### Migration fails
- Check Vercel build logs for exact error
- Verify migration files exist in `prisma/migrations/`
- Ensure database is not paused in Supabase

### 401 Unauthorized on dashboard
- Verify `FENCE_SESSION_SECRET` is set
- Check session cookie is being set correctly
- Try clearing browser cookies

## Migration Management

### Create New Migration (Requires DB Access)

From a network with Supabase access:
```bash
npx prisma migrate dev --name description
git add prisma/migrations
git commit -m "Add migration: description"
git push
```

Vercel will apply it automatically on next deploy.

### Reset Database (Production)

**⚠️ DESTRUCTIVE - Only for testing**:
```bash
# In Vercel dashboard or CLI
DATABASE_URL="..." npx prisma migrate reset
```

## Current Status

✅ Migrations exist: `20260109061747_db_layer_expand`  
✅ Build pipeline configured  
✅ Environment variables documented  
✅ Local env files gitignored  
⏳ Awaiting Vercel deployment
