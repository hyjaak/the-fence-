# Database Setup Instructions

## Step 1: Set Environment Variable in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:[Rawjitta_24]@db.itarkoqfrddjgespxpjh.supabase.co:5432/postgres?sslmode=require`
   - **Environments**: Production, Preview, Development
3. Click **Save**

## Step 2: Create Database Tables

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Open `supabase-setup.sql` from this repository
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click **Run** or press `Ctrl+Enter`

You should see: "Success. No rows returned"

## Step 3: Verify Setup

Visit: `https://your-vercel-url.vercel.app/api/health`

**Expected response:**
```json
{
  "status": "ok",
  "database": "connected",
  "tables": "accessible",
  "userCount": 1,
  "timestamp": "2026-01-09T..."
}
```

**If you see error:**
- `DATABASE_URL not configured` → Go to Step 1
- `Database tables not created` → Go to Step 2
- `Cannot connect to database` → Check DATABASE_URL value

## Step 4: Test Login

**Credentials:**
- Username: `admin`
- Password: `admin123`

Visit: `https://your-vercel-url.vercel.app/login`

## Troubleshooting

### "Internal server error" on login
1. Check `/api/health` endpoint first
2. View Vercel function logs: Vercel Dashboard → Deployments → [Your deployment] → Functions
3. Look for `[LOGIN_ERROR]` messages

### Database connection works but login fails
- Verify tables exist: Run `SELECT * FROM "User";` in Supabase SQL Editor
- Check password hash was created correctly
- View Vercel logs for detailed error messages

### Local development
Local database access is blocked. All testing must be done via Vercel deployment.
