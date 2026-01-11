export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('fence_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const systemState = await prisma.systemState.findUnique({
      where: { id: 1 },
    });

    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const guardrails = await prisma.guardrail.findMany({
      orderBy: { name: 'asc' },
    });

    const failingCount = guardrails.filter(g => g.status === 'FAILING').length;
    const warningCount = guardrails.filter(g => g.status === 'WARNING').length;

    const status = failingCount > 0 ? 'RED' : warningCount > 0 ? 'YELLOW' : 'GREEN';

    return NextResponse.json({
      systemState: {
        state: systemState?.state || status,
        message: systemState?.message || 'System operational',
        lastUpdate: events[0]?.createdAt.toISOString() || new Date().toISOString(),
      },
      events: events.map((e) => ({
        id: e.id,
        timestamp: e.createdAt.toISOString(),
        type: e.type,
        description: e.message,
        severity: 'info',
      })),
      guardrails: guardrails.map((g) => ({
        id: g.id,
        name: g.name,
        status: g.status.toLowerCase(),
        threshold: g.threshold,
        currentValue: g.current,
      })),
      user: {
        username: session.user.username,
        role: session.user.role,
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
