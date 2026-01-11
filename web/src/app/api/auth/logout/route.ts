export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.delete('fence_session');
  response.cookies.delete('fence_user');
  response.cookies.delete('fence_role');
  
  return response;
}
