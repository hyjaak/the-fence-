export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(null, { status: 204 });
  }

  try {
    const token = request.cookies.get('fence_session')?.value;
    const username = request.cookies.get('fence_user')?.value;
    const role = request.cookies.get('fence_role')?.value;

    if (!token || !username || !role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to fetch real data from database
    let dbAvailable = true;
    let systemState = null;
    let events = [];
    let guardrails = [];

    try {
      // Test DB connection with a simple query
      await prisma.$queryRaw`SELECT 1`;

      // Fetch real data
      const stateRecord = await prisma.systemState.findFirst();
      systemState = stateRecord || {
        state: 'OPERATIONAL',
        message: 'All systems nominal',
        lastUpdate: new Date().toISOString(),
      };

      const recentEvents = await prisma.event.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      events = recentEvents.map(e => ({
        id: e.id,
        timestamp: e.createdAt.toISOString(),
        type: e.type,
        description: e.message,
        severity: 'info',
      }));

      const activeGuardrails = await prisma.guardrail.findMany();
      guardrails = activeGuardrails.map(g => ({
        id: g.id,
        name: g.name,
        status: g.status,
        threshold: g.threshold,
        currentValue: g.current,
      }));
    } catch (dbError) {
      console.error('[DASHBOARD] Database unavailable, using fallback data:', dbError);
      dbAvailable = false;

      // Fallback to safe mock data
      systemState = {
        state: 'DEGRADED',
        message: 'Database temporarily unavailable - read-only mode',
        lastUpdate: new Date().toISOString(),
      };

      events = [
        {
          id: 'mock-1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          type: 'SYSTEM',
          description: 'System running in read-only mode',
          severity: 'warning',
        },
      ];

      guardrails = [
        {
          id: 'mock-1',
          name: 'Execution Budget',
          status: 'unknown',
          threshold: '1000',
          currentValue: 'N/A',
        },
        {
          id: 'mock-2',
          name: 'State Coherence',
          status: 'unknown',
          threshold: '95%',
          currentValue: 'N/A',
        },
      ];
    }

    return NextResponse.json({
      systemStatus: dbAvailable ? 'OPERATIONAL' : 'DEGRADED',
      mode: dbAvailable ? 'NORMAL' : 'READ_ONLY',
      systemState,
      events,
      guardrails,
      user: {
        username,
        role,
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    
    // Even if everything fails, return safe fallback
    return NextResponse.json({
      systemStatus: 'DEGRADED',
      mode: 'READ_ONLY',
      systemState: {
        state: 'ERROR',
        message: 'Service temporarily unavailable',
        lastUpdate: new Date().toISOString(),
      },
      events: [],
      guardrails: [],
      user: {
        username: 'unknown',
        role: 'UNKNOWN',
      },
    }, { status: 200 }); // Return 200, not 500 - graceful degradation
  }
}
