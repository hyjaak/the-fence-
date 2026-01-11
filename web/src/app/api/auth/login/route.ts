export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(null, { status: 204 });
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
    const OPERATOR_USER = process.env.OPERATOR_USERNAME || 'operator';
    const OPERATOR_PASS = process.env.OPERATOR_PASSWORD || 'operator123';

    let userRole = null;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      userRole = 'ADMIN';
    } else if (username === OPERATOR_USER && password === OPERATOR_PASS) {
      userRole = 'OPERATOR';
    }

    if (!userRole) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = randomBytes(32).toString('hex');

    const redirectUrl = new URL('/dashboard', request.url);
    const response = NextResponse.redirect(redirectUrl);

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

    return response;
  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
