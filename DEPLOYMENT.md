# THE FENCE - DEPLOYMENT GUIDE

## Local Development
```bash
cd web
npm install
npm run dev
```
Server runs at http://localhost:3000

## Production Deployment (Vercel + Postgres)

### Step 1: Create Production Database

**Option A - Neon (Recommended)**
1. Go to https://neon.tech
2. Create new project
3. Copy DATABASE_URL (format: `postgresql://user:pass@host/dbname`)

**Option B - Supabase**
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings > Database
4. Use "Connection pooling" URL for production

### Step 2: Configure Environment Variables

Add to Vercel project settings:
```
DATABASE_URL=postgresql://user:pass@host/dbname
FENCE_SESSION_SECRET=<generate-random-32-char-string>
```

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Deploy to Vercel

**First-Time Setup**
```bash
cd web
npx vercel
```

**Subsequent Deployments**
```bash
git add .
git commit -m "Update"
git push
```

Vercel auto-deploys on push if GitHub integration is active.

### Step 4: Run Database Migrations

After first deploy:
1. Go to Vercel project > Settings > Functions
2. Run command in Vercel CLI or dashboard:
```bash
npm run db:migrate
```

Or manually:
```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

### Step 5: Seed Production Database (Optional)

**Warning: Only run once on fresh database**
```bash
DATABASE_URL="your-production-url" npm run db:seed
```

Creates demo users:
- admin / admin123
- operator / operator123
- viewer / viewer

### Step 6: Verify Deployment

1. Visit https://your-app.vercel.app/login
2. Login with admin/admin123
3. Check /dashboard loads
4. Click control panel buttons
5. Verify new events appear in Recent Events

## Editing Workflow

1. **Edit locally**: Make changes in VS Code
2. **Test**: `npm run dev` at localhost:3000
3. **Commit**: `git add . && git commit -m "description"`
4. **Push**: `git push`
5. **Auto-deploy**: Vercel builds and deploys preview
6. **Promote**: Merge to main branch for production

## Database Schema Changes

1. Edit `prisma/schema.prisma`
2. Create migration:
```bash
npx prisma migrate dev --name description
```
3. Commit migration files
4. Push to trigger deployment
5. Vercel runs `prisma migrate deploy` automatically via build script

## Troubleshooting

**Build fails with Prisma error**
- Check DATABASE_URL is set in Vercel env vars
- Ensure `postinstall` script runs `prisma generate`

**Session cookie not working**
- Verify FENCE_SESSION_SECRET is set
- Check cookie domain settings in production

**Database connection timeout**
- Use connection pooling URL (Neon/Supabase)
- Check database allows connections from Vercel IPs

**Middleware Edge Runtime error**
- Confirm `src/middleware.ts` has NO Prisma imports
- Session validation must happen in API routes only
