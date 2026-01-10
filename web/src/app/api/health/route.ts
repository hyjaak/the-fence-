import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        status: 'error',
        error: 'DATABASE_URL not configured',
        details: 'Set DATABASE_URL in Vercel environment variables'
      }, { status: 500 });
    }

    // Try to connect to database
    await prisma.$queryRaw`SELECT 1`;

    // Try to query User table
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      tables: 'accessible',
      userCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[HEALTH_CHECK_ERROR]', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a table not found error
    if (errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
      return NextResponse.json({
        status: 'error',
        error: 'Database tables not created',
        details: 'Run supabase-setup.sql in Supabase SQL Editor',
        errorMessage
      }, { status: 500 });
    }

    // Check if it's a connection error
    if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json({
        status: 'error',
        error: 'Cannot connect to database',
        details: 'Check DATABASE_URL is correct',
        errorMessage
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'error',
      error: 'Database health check failed',
      errorMessage
    }, { status: 500 });
  }
}
