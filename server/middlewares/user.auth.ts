import { NextFunction, Request, Response } from "express";

function requireAuth(req: Request, res: Response, next: NextFunction): void {
 if (req.session && req.session.authenticated) {
  return next();
 }
 res.status(401).json({ error: 'Unauthorized' });
}

export default requireAuth;