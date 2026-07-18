import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth.js";

export interface AuthedRequest extends Request {
  userId?: string;
}

// Validates the Better Auth session (spec §6.4). Attaches userId or 401s.
export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = session.user.id;
  next();
}
