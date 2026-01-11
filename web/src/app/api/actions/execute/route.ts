export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(null, { status: 204 });
  }

  const startTime = Date.now();

  try {
    const token = request.cookies.get('fence_session')?.value;
    const role = request.cookies.get('fence_role')?.value;
    const username = request.cookies.get('fence_user')?.value;

    if (!token || !role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (role !== 'ADMIN' && role !== 'OPERATOR') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Log action attempt with latency tracking
    const latencyMs = Date.now() - startTime;
    
    try {
      await logAudit({
        actorRole: role as 'ADMIN' | 'OPERATOR',
        actorUsername: username || null,
        action: 'EXECUTE_ACTION_REQUEST',
        status: 'SUCCESS',
        meta: { latencyMs },
        req: request,
      });
    } catch (auditError) {
      console.error('[AUDIT_LOG_FAILED]', auditError);
      // Continue even if audit fails - don't block the action
    }

    return NextResponse.json({ ok: true, latencyMs });
  } catch (error) {
    console.error('Execute action error:', error);
    
    // Try to log the failure
    try {
      const username = request.cookies.get('fence_user')?.value;
      const role = request.cookies.get('fence_role')?.value;
      await logAudit({
        actorRole: (role as 'ADMIN' | 'OPERATOR') || 'UNKNOWN',
        actorUsername: username || null,
        action: 'EXECUTE_ACTION_REQUEST',
        status: 'FAIL',
        meta: { 
          error: error instanceof Error ? error.message : 'Unknown',
          latencyMs: Date.now() - startTime,
        },
        req: request,
      });
    } catch (auditError) {
      console.error('[AUDIT_LOG_FAILED]', auditError);
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

