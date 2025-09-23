import { ChangeEvent, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { FileInfo } from "../../server/controllers/file.controller";

function humanSize(bytes: number) {
 if (bytes < 1024) return bytes + ' B';
 const units = ['KB', 'MB', 'GB', 'TB'];
 let i = -1;
 do {
  bytes /= 1024;
  i++;
 } while (bytes >= 1024 && i < units.length - 1);
 return `${bytes.toFixed(2)} ${units[i]}`;
}

export default function Uploads({ onLogout }: { onLogout: () => void }) {
 const [files, setFiles] = useState<FileInfo[]>([]);
 const [selected, setSelected] = useState<File[]>([]);
 const [progress, setProgress] = useState<{ [key: string]: unknown }>({}); // filename -> percent
 const [uploading, setUploading] = useState(false);
 const API = axios.create({ withCredentials: true });

 useEffect(() => {
  fetchFiles();
 }, []);

 async function fetchFiles() {
  try {
   const res = await API.get('/api/file/list');
   setFiles(res.data.files || []);
  } catch (e) {
   if ((e as AxiosError).response?.status === 401) {
    // session expired
    onLogout();
   }
  }
 }

 function onFileChange(e: ChangeEvent<HTMLInputElement>) {
  setSelected(Array.from(e.target.files ?? []));
 }

 async function uploadAll() {
  if (!selected.length) return;
  setUploading(true);
  setProgress({});
  for (const file of selected) {
   const form = new FormData();
   form.append('files', file);
   try {
    await API.post('/api/file/upload', form, {
     headers: { 'Content-Type': 'multipart/form-data' },
     onUploadProgress: (ev) => {
      const pct = Math.round((ev.loaded / (ev.total ?? 100)) * 100);
      setProgress(prev => ({ ...prev, [file.name]: pct }));
     }
    });
   } catch (err) {
    console.error('Upload failed', err);
   }
  }
  setSelected([]);
  setUploading(false);
  fetchFiles();
 }

 async function handleLogout() {
  await API.post('/api/user/logout');
  onLogout();
 }

 function copyLink(url: string) {
  const full = (import.meta.env.DEV ? `http://localhost:${import.meta.env.VITE_PORT}` : location.origin) + url;
  navigator.clipboard.writeText(full).then(() => alert('Link copied to clipboard'));
 }

 async function deleteFile(filename: string) {
  if (!window.confirm(`Delete ${filename}?`)) return;
  try {
   await API.delete(`/api/file/delete/${encodeURIComponent(filename)}`);
   fetchFiles();
  } catch (err) {
   console.error('Delete failed', err);
   alert('Failed to delete file');
  }
 }

 return (
  <div className="space-y-4">
   <div className="flex justify-between items-center">
    <div className="text-sm text-slate-400">Logged in</div>
    <div className="flex gap-2">
     <button onClick={fetchFiles} className="px-3 py-1 rounded bg-sky-600">Refresh</button>
     <button onClick={handleLogout} className="px-3 py-1 rounded bg-rose-600">Logout</button>
    </div>
   </div>

   <div className="p-4 bg-slate-700 rounded">
    <input type="file" multiple onChange={onFileChange} />
    <div className="mt-2">
     <button onClick={uploadAll} disabled={uploading || !selected.length} className="px-4 py-2 rounded bg-emerald-500 disabled:opacity-50">
      Upload {selected.length ? `(${selected.length})` : ''}
     </button>
    </div>

    <div className="mt-3 space-y-2">
     {selected.map(f => (
      <div key={f.name} className="bg-slate-800 p-2 rounded">
       <div className="flex justify-between">
        <div>{f.name} <span className="text-slate-400 text-sm">({humanSize(f.size)})</span></div>
        <div className="text-slate-400 text-sm">{progress[f.name] ? `${progress[f.name]}%` : ''}</div>
       </div>
       <div className="w-full bg-slate-600 h-2 rounded mt-2">
        <div style={{ width: `${progress[f.name] || 0}%` }} className="h-2 rounded bg-emerald-400"></div>
       </div>
      </div>
     ))}
    </div>
   </div>

   <div>
    <h2 className="text-lg font-medium">Uploaded files</h2>
    <div className="mt-2 space-y-2">
     {files.length === 0 && <div className="text-slate-400">No files yet.</div>}
     {files.map((f, i) => (
      <div key={i} className="flex items-center justify-between p-3 bg-slate-700 rounded">
       <div>
        <div className="font-medium">{f.filename}</div>
        <div className="text-sm text-slate-400">{humanSize(f.size)} • {f.mtime ? new Date(f.mtime).toLocaleString() : ""}</div>
       </div>
       <div className="flex items-center gap-2">
        <a
         target="_blank"
         rel="noreferrer"
         href={(import.meta.env.DEV ? `http://localhost:${import.meta.env.VITE_PORT}` : location.origin) + f.url}
         className="px-3 py-1 rounded bg-indigo-600">
         Open
        </a>
        <button
         onClick={() => copyLink(f.url)}
         className="px-3 py-1 rounded bg-amber-500">
         Copy link
        </button>
        <button
         onClick={() => deleteFile(f.filename)}
         className="px-3 py-1 rounded bg-rose-600"
        >
         Delete
        </button>
       </div>
      </div>
     ))}
    </div>
   </div>

  </div>
 );
}
