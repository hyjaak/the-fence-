export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(null, { status: 204 });
  }

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

    if (session.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    await prisma.event.create({
      data: {
        type: 'ACTION_EXECUTE',
        message: `${session.user.username} (${session.user.role}) executed demo action`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'EXECUTE_ACTION',
        details: 'Demo-safe execution triggered',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Execute action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
