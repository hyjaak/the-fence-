import { prisma } from './prisma';
import { NextRequest } from 'next/server';

interface AuditLogParams {
  actorRole: 'ADMIN' | 'OPERATOR' | 'SYSTEM' | 'UNKNOWN';
  actorUsername?: string | null;
  action: string;
  status: 'SUCCESS' | 'FAIL';
  meta?: Record<string, any> | null;
  req?: NextRequest | Request | null;
}

/**
 * Safe audit logger - never throws, never breaks requests
 * Logs important actions to the AuditLog table
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const { actorRole, actorUsername, action, status, meta, req } = params;

    // Extract IP and user-agent from request if provided
    let ip: string | null = null;
    let userAgent: string | null = null;

    if (req) {
      // Try to get IP from various headers (Vercel, Cloudflare, etc.)
      const forwardedFor = req.headers.get('x-forwarded-for');
      const realIp = req.headers.get('x-real-ip');
      
      if (forwardedFor) {
        // Take first IP if comma-separated list
        ip = forwardedFor.split(',')[0].trim();
      } else if (realIp) {
        ip = realIp;
      }

      // Get user agent
      userAgent = req.headers.get('user-agent');
    }

    // Attempt to write audit log to database
    await prisma.auditLog.create({
      data: {
        actorRole,
        actorUsername: actorUsername || null,
        action,
        status,
        ip,
        userAgent,
        meta: meta ? (meta as any) : undefined,
      },
    });
  } catch (error) {
    // Silently fail - audit logging should never break the main request
    // But log to console for debugging
    console.error('[AUDIT_LOG_ERROR]', {
      action: params.action,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
