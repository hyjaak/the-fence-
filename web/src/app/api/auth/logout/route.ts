export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const username = request.cookies.get('fence_user')?.value;
  const role = request.cookies.get('fence_role')?.value;

  const response = NextResponse.json({ success: true });
  
  response.cookies.delete('fence_session');
  response.cookies.delete('fence_user');
  response.cookies.delete('fence_role');

  await logAudit({
    actorRole: (role as 'ADMIN' | 'OPERATOR') || 'UNKNOWN',
    actorUsername: username || null,
    action: 'LOGOUT',
    status: 'SUCCESS',
    req: request,
  });
  
  return response;
}
