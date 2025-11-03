// server/index.ts
import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import userRouter from "./routers/user.router";
import fileRouter from "./routers/file.router";

// Extend session interface to include custom properties
declare module 'express-session' {
  interface SessionData {
    authenticated?: boolean;
    user?: string;
  }
}

const PORT = process.env.VITE_PORT || 4000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change_this_secret';
export const UPLOAD_DIR = path.resolve("./server/public/uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({
  limit: "25mb"
}));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

app.use('/', express.static(path.resolve("./dist")));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use("/api/user", userRouter);
app.use("/api/file", fileRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});