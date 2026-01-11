export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(null, { status: 204 });
  }

  try {
    const token = request.cookies.get('fence_session')?.value;
    const role = request.cookies.get('fence_role')?.value;
    const username = request.cookies.get('fence_user')?.value;

    if (!token || !role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await logAudit({
      actorRole: 'ADMIN',
      actorUsername: username || null,
      action: 'CONFIG_MODIFY_REQUEST',
      status: 'SUCCESS',
      req: request,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Modify config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

