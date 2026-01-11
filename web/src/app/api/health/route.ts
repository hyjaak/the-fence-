export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(null, { status: 204 });
  }

  const result: any = {
    ok: false,
    timestamp: new Date().toISOString(),
    build: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    db: {
      connected: false,
      latencyMs: null,
      error: null,
    },
  };

  try {
    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      result.db.error = 'DATABASE_URL environment variable not set';
      return NextResponse.json(result, { status: 500 });
    }

    // Test database connection with latency measurement - lightweight query
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1 as health_check`;
      const endTime = Date.now();
      result.db.connected = true;
      result.db.latencyMs = endTime - startTime;
      result.ok = true;
      result.message = 'Database connected successfully';
    } catch (dbError) {
      const errorMsg = dbError instanceof Error ? dbError.message : 'Unknown';
      result.db.error = `Connection failed: ${errorMsg}`;
      result.message = 'Database connection failed';
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('[HEALTH_CHECK_ERROR]', error);
    result.db.error = error instanceof Error ? error.message : 'Unknown error';
    result.message = 'Health check failed';
    return NextResponse.json(result, { status: 500 });
  }
}
