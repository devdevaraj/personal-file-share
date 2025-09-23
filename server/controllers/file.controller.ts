import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.resolve("./server/public/uploads");
console.log(UPLOAD_DIR);

export interface FileInfo {
 filename: string;
 originalname?: string;
 size: number;
 url: string;
 mtime?: Date;
}

export async function upload(req: Request, res: Response) {
 const files: FileInfo[] = (req.files as Express.Multer.File[] || []).map((f: Express.Multer.File) => ({
  filename: f.filename,
  originalname: f.originalname,
  size: f.size,
  url: `/uploads/${encodeURIComponent(f.filename)}`
 }));

 res.json({ success: true, files });
}

export async function list(_: Request, res: Response) {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read uploads' });
    }
    
    const list: FileInfo[] = files.map((fn: string) => {
      const stat = fs.statSync(path.join(UPLOAD_DIR, fn));
      return {
        filename: fn,
        url: `/uploads/${encodeURIComponent(fn)}`,
        size: stat.size,
        mtime: stat.mtime
      };
    }).sort((a, b) => (b.mtime?.getTime() || 0) - (a.mtime?.getTime() || 0));
    
    res.json({ files: list });
  });
}

export async function del(req: Request, res: Response) {
  const fn = path.join(UPLOAD_DIR, path.basename(req.params.filename));
  fs.unlink(fn, (err) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ success: true });
  });
}