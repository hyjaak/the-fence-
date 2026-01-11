export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(null, { status: 204 });
  }

  console.log('[LOGIN] Starting login request');

  try {
    const body = await request.json();
    console.log('[LOGIN] Request body parsed, username:', body.username);
    const { username, password } = body;

    if (!username || !password) {
      console.log('[LOGIN] Missing username or password');
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
    const OPERATOR_USER = process.env.OPERATOR_USERNAME || 'operator';
    const OPERATOR_PASS = process.env.OPERATOR_PASSWORD || 'operator123';

    console.log('[LOGIN] Environment check - ADMIN_USER exists:', !!process.env.ADMIN_USERNAME);
    console.log('[LOGIN] Environment check - ADMIN_PASS exists:', !!process.env.ADMIN_PASSWORD);

    let userRole = null;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      userRole = 'ADMIN';
    } else if (username === OPERATOR_USER && password === OPERATOR_PASS) {
      userRole = 'OPERATOR';
    }

    if (!userRole) {
      console.log('[LOGIN] Invalid credentials for user:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('[LOGIN] User authenticated, role:', userRole);
    const token = randomBytes(32).toString('hex');

    const response = NextResponse.json(
      { success: true, role: userRole },
      { status: 200 }
    );

    response.cookies.set({
      name: 'fence_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set({
      name: 'fence_user',
      value: username,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set({
      name: 'fence_role',
      value: userRole,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log('[LOGIN] Login successful, cookies set');
    return response;
  } catch (error) {
    console.error('[LOGIN_ERROR] Exception caught:', error);
    console.error('[LOGIN_ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
