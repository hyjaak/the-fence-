export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(null, { status: 204 });
  }

  try {
    const token = request.cookies.get('fence_session')?.value;
    const role = request.cookies.get('fence_role')?.value;

    if (!token || !role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Deploy change error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

