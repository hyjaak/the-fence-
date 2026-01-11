export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

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

    const mockSystemState = {
      state: 'OPERATIONAL',
      message: 'All systems nominal',
      lastUpdate: new Date().toISOString(),
    };

    const mockEvents = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: 'SYSTEM',
        description: 'System initialized',
        severity: 'info',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        type: 'AUTH',
        description: `${username} logged in`,
        severity: 'info',
      },
    ];

    const mockGuardrails = [
      {
        id: '1',
        name: 'Execution Budget',
        status: 'safe',
        threshold: '1000',
        currentValue: '142',
      },
      {
        id: '2',
        name: 'State Coherence',
        status: 'safe',
        threshold: '95%',
        currentValue: '98.2%',
      },
      {
        id: '3',
        name: 'Action Approval Rate',
        status: 'warning',
        threshold: '80%',
        currentValue: '76.5%',
      },
    ];

    return NextResponse.json({
      systemState: mockSystemState,
      events: mockEvents,
      guardrails: mockGuardrails,
      user: {
        username,
        role,
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
