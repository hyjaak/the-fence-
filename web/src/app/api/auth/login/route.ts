export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(null, { status: 204 });
  }

  try {
    console.log('[LOGIN] Starting login attempt');
    console.log('[LOGIN] NODE_ENV:', process.env.NODE_ENV);
    console.log('[LOGIN] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Check DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error('[LOGIN_ERROR] DATABASE_URL environment variable is not set');
      console.error('[LOGIN_ERROR] Available env vars:', Object.keys(process.env).filter(k => !k.includes('SECRET')));
      return NextResponse.json(
        { error: 'Database not configured. Set DATABASE_URL in Vercel environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    console.log('[LOGIN] Credentials received for username:', username);

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    console.log('[LOGIN] Querying database for user:', username);
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.log('[LOGIN] User not found:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('[LOGIN] User found, verifying password');
    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      console.log('[LOGIN] Invalid password for user:', username);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('[LOGIN] Password valid, creating session');
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    console.log('[LOGIN] Session created successfully');
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

    console.log('[LOGIN] Login successful, redirecting to dashboard');
    return response;
  } catch (error) {
    console.error('[LOGIN_ERROR] Full error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
