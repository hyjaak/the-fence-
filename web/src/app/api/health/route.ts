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
      NODE_ENV: process.env.NODE_ENV,
    },
    db: {
      connected: false,
      latencyMs: null,
      error: null,
    },
    tables: {
      User: false,
      Session: false,
      AuditLog: false,
      Event: false,
      Guardrail: false,
      Config: false,
      SystemState: false,
    },
  };

  try {
    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      result.db.error = 'DATABASE_URL environment variable not set';
      return NextResponse.json(result, { status: 500 });
    }

    // Test database connection with latency measurement
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const endTime = Date.now();
      result.db.connected = true;
      result.db.latencyMs = endTime - startTime;
    } catch (dbError) {
      const errorMsg = dbError instanceof Error ? dbError.message : 'Unknown';
      result.db.error = `Connection failed: ${errorMsg}`;
      return NextResponse.json(result, { status: 500 });
    }

    // Check each table exists and has data
    try {
      const userCount = await prisma.user.count();
      result.tables.User = { exists: true, count: userCount };
    } catch (e) {
      result.tables.User = { exists: false, error: e instanceof Error ? e.message : 'Unknown' };
    }

    try {
      const sessionCount = await prisma.session.count();
      result.tables.Session = { exists: true, count: sessionCount };
    } catch (e) {
      result.tables.Session = { exists: false, error: e instanceof Error ? e.message : 'Unknown' };
    }

    try {
      const auditCount = await prisma.auditLog.count();
      result.tables.AuditLog = { exists: true, count: auditCount };
    } catch (e) {
      result.tables.AuditLog = { exists: false, error: e instanceof Error ? e.message : 'Unknown' };
    }

    try {
      const eventCount = await prisma.event.count();
      result.tables.Event = { exists: true, count: eventCount };
    } catch (e) {
      result.tables.Event = { exists: false, error: e instanceof Error ? e.message : 'Unknown' };
    }

    try {
      const guardrailCount = await prisma.guardrail.count();
      result.tables.Guardrail = { exists: true, count: guardrailCount };
    } catch (e) {
      result.tables.Guardrail = { exists: false, error: e instanceof Error ? e.message : 'Unknown' };
    }

    try {
      const configCount = await prisma.config.count();
      result.tables.Config = { exists: true, count: configCount };
    } catch (e) {
      result.tables.Config = { exists: false, error: e instanceof Error ? e.message : 'Unknown' };
    }

    try {
      const stateCount = await prisma.systemState.count();
      result.tables.SystemState = { exists: true, count: stateCount };
    } catch (e) {
      result.tables.SystemState = { exists: false, error: e instanceof Error ? e.message : 'Unknown' };
    }

    // Overall health
    const allTablesExist = Object.values(result.tables).every(
      (t: any) => t.exists === true
    );

    result.ok = result.db.connected && allTablesExist;

    if (!allTablesExist) {
      result.message = 'Database connected but some tables missing. Run supabase-setup.sql in Supabase SQL Editor.';
    } else if (result.tables.User.count === 0) {
      result.message = 'Tables exist but no users found. Run supabase-setup.sql to seed data.';
    } else {
      result.message = 'All systems operational';
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 500 });

  } catch (error) {
    console.error('[HEALTH_CHECK_ERROR]', error);
    result.db.error = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(result, { status: 500 });
  }
}
