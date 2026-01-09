import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await prisma.event.create({
      data: {
        type: 'CONFIG_UPDATE',
        message: `${session.user.username} modified configuration (demo-safe)`,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'MODIFY_CONFIG',
        details: 'Demo-safe configuration change',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Modify config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
