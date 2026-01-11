# THE FENCE — SUPABASE + VERCEL DEPLOYMENT GUIDE

## STEP 1: CREATE SUPABASE DATABASE

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `the-fence`
   - Database Password: (generate strong password, save it)
   - Region: Choose closest to your users
4. Wait ~2 minutes for provisioning

## STEP 2: GET DATABASE CONNECTION STRING

1. In Supabase project dashboard → Settings → Database
2. Scroll to "Connection string" section
3. Select **"Connection pooling"** tab (REQUIRED for Vercel)
4. Mode: **Transaction**
5. Copy the connection string (format: `postgresql://postgres.xxx:[YOUR-PASSWORD]@...pooler.supabase.com:6543/postgres?pgbouncer=true`)
6. Replace `[YOUR-PASSWORD]` with your database password

**Example:**
```
postgresql://postgres.abcdefgh:MySecretPass123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## STEP 3: UPDATE LOCAL ENVIRONMENT

Edit `web/.env.local`:

```env
DATABASE_URL="postgresql://postgres.xxx:YourPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
FENCE_SESSION_SECRET="your-random-32-char-secret"
```

Generate session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## STEP 4: RUN PRISMA MIGRATIONS LOCALLY

```bash
cd web
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

This creates tables and seeds demo users in Supabase.

## STEP 5: VERIFY LOCAL CONNECTION

```bash
npm run dev
```

- Visit http://localhost:3000/login
- Login with `admin` / `admin123`
- Confirm dashboard loads with data from Supabase

## STEP 6: PUSH CODE TO GITHUB

```bash
cd C:\Users\GRANDMASTER BADGER\Documents\fence
git init
git add .
git commit -m "Initial commit - THE FENCE with Supabase"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/the-fence.git
git push -u origin main
```

## STEP 7: DEPLOY TO VERCEL

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   ```
   Name: DATABASE_URL
   Value: postgresql://postgres.xxx:YourPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   
   Name: FENCE_SESSION_SECRET
   Value: (paste the 64-char hex string from Step 3)
   ```

6. Click **Deploy**

## STEP 8: RUN PRODUCTION MIGRATIONS

After first deployment completes:

**Option A - Via Vercel CLI:**
```bash
npx vercel env pull
cd web
npx prisma migrate deploy
npm run db:seed
```

**Option B - Via Supabase SQL Editor:**
1. Go to Supabase dashboard → SQL Editor
2. Run migration SQL manually from `web/prisma/migrations/*/migration.sql`

## STEP 9: VERIFY LIVE DEPLOYMENT

1. Open your Vercel deployment URL (e.g., `https://the-fence.vercel.app`)
2. Go to `/login`
3. Login with:
   - Username: `admin`
   - Password: `admin123`
4. Confirm:
   - ✅ Dashboard loads
   - ✅ Recent Events shows data from Supabase
   - ✅ Control panel buttons work
   - ✅ New events appear after button clicks

## TROUBLESHOOTING

### Build fails with "Can't reach database server"
- Verify DATABASE_URL is set in Vercel environment variables
- Check password is correct (no special URL encoding needed)
- Ensure using **Connection pooling** URL (port 6543, not 5432)

### Session cookie not working
- Verify FENCE_SESSION_SECRET is set in Vercel
- Check it's at least 32 characters

### 401 Unauthorized loop
- Middleware is Edge-compatible (no Prisma imports) ✅
- Session validation happens in API routes only ✅
- Clear browser cookies and try again

### Database connection timeout
- Use Transaction mode (not Session mode) in pooler
- Connection string must include `?pgbouncer=true`

## EDITING WORKFLOW (AFTER DEPLOYMENT)

1. **Edit locally**: Make changes in VS Code
2. **Test**: `npm run dev` → http://localhost:3000
3. **Commit**: `git add . && git commit -m "description"`
4. **Push**: `git push`
5. **Auto-deploy**: Vercel automatically builds and deploys
6. **View**: Check deployment at your Vercel URL

## CURRENT STATUS

✅ Middleware is Edge-compatible (no Prisma imports)
✅ Schema configured for PostgreSQL
✅ Build scripts include `prisma generate`
✅ Migration exists: `20260109061747_db_layer_expand`
✅ Production build passes
✅ Seed script ready with demo users

**Ready to deploy!**
