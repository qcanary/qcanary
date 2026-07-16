import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '@clerk/express';
import { errorResponse } from '../lib/responseUtils';

export interface BearerAuthedRequest extends Request {
  clerkUserId?: string;
  clerkOrgId?: string;
}

export async function requireBearerAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      errorResponse(res, 401, 'UNAUTHORIZED', 'Missing Bearer token');
      return;
    }

    const token = authHeader.slice(7);
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      errorResponse(res, 500, 'CONFIG_ERROR', 'CLERK_SECRET_KEY not configured');
      return;
    }

    const payload = await verifyToken(token, { secretKey });
    const scopedReq = req as BearerAuthedRequest;
    scopedReq.clerkUserId = payload.sub;
    scopedReq.clerkOrgId = payload.org_id as string | undefined;
    next();
  } catch {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}
