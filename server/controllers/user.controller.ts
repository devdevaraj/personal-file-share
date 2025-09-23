import { Request, Response } from "express";

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password';

interface LoginRequest {
 username?: string;
 password?: string;
}

export async function login(req: Request<object, object, LoginRequest>, res: Response) {
 const { username, password } = req.body ?? {};

 if (username === ADMIN_USER && password === ADMIN_PASS) {
  req.session.authenticated = true;
  req.session.user = username;
  return res.json({ success: true });
 }

 return res.status(401).json({ success: false, error: 'Invalid credentials' });
}

export async function logout(req: Request, res: Response) {
 req.session.destroy((err) => {
  res.clearCookie('connect.sid');
  if (err) {
   return res.status(500).json({ error: 'Failed to logout' });
  }
  return res.json({ success: true });
 });
}

export async function me(req: Request, res: Response) {
 res.json({
  authenticated: !!(req.session && req.session.authenticated)
 });
}