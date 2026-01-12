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

const Icons = {
 Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
 File: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>,
 Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
 Logout: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
 Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
 Link: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
 ExternalLink: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
 X: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

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
  <div className="space-y-8">
   <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
    <div className="flex items-center gap-3">
     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
      A
     </div>
     <div>
      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Admin User</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">Authenticated</div>
     </div>
    </div>
    <div className="flex gap-2">
     <button
      onClick={fetchFiles}
      className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      title="Refresh List"
     >
      <Icons.Refresh />
     </button>
     <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors text-sm font-medium"
     >
      <Icons.Logout /> Logout
     </button>
    </div>
   </div>

   <div className="bg-slate-50 dark:bg-slate-900/30 rounded-3xl p-1 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors group relative">
    <input
     type="file"
     multiple
     onChange={onFileChange}
     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
    />
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
     <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
      <Icons.Upload />
     </div>
     <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
      {selected.length ? `${selected.length} file(s) selected` : 'Drop files here or click to upload'}
     </h3>
     <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
      Support for multiple file uploads
     </p>
    </div>
   </div>

   {selected.length > 0 && (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-4">
     <div className="flex justify-between items-center">
      <h4 className="font-medium text-slate-700 dark:text-slate-200">Selected Files</h4>
      <button
       onClick={uploadAll}
       disabled={uploading}
       className="px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
      >
       {uploading ? 'Uploading...' : 'Start Upload'}
      </button>
     </div>

     <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
      {selected.map(f => (
       <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700/50">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
         <Icons.File />
        </div>
        <div className="flex-1 min-w-0">
         <div className="flex justify-between mb-1">
          <span className="truncate font-medium text-slate-700 dark:text-slate-200 text-sm">{f.name}</span>
          <span className="text-xs text-slate-500">{humanSize(f.size)}</span>
         </div>
         <div className="w-full bg-slate-200 dark:bg-slate-600 h-1.5 rounded-full overflow-hidden">
          <div
           style={{ width: `${progress[f.name] || 0}%` }}
           className="h-full bg-indigo-500 transition-all duration-300 ease-out"
          ></div>
         </div>
        </div>
       </div>
      ))}
     </div>
    </div>
   )}

   <div>
    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
     Your Files <span className="text-sm font-normal text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{files.length}</span>
    </h2>

    {files.length === 0 ? (
     <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
      No files uploaded yet.
     </div>
    ) : (
     <div className="grid gap-3">
      {files.map((f, i) => (
       <div key={i} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-indigo-900/10 transition-all duration-200">
        <div className="flex items-start gap-4 mb-4 sm:mb-0">
         <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
          <Icons.File />
         </div>
         <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200 break-all">{f.filename}</div>
          <div className="text-xs text-slate-500 flex gap-2 mt-1">
           <span>{humanSize(f.size)}</span>
           <span>•</span>
           <span>{f.mtime ? new Date(f.mtime).toLocaleString() : ""}</span>
          </div>
         </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
         <a
          target="_blank"
          rel="noreferrer"
          href={(import.meta.env.DEV ? `http://localhost:${import.meta.env.VITE_PORT}` : location.origin) + f.url}
          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          title="Open File"
         >
          <Icons.ExternalLink />
         </a>
         <button
          onClick={() => copyLink(f.url)}
          className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          title="Copy Link"
         >
          <Icons.Link />
         </button>
         <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
         <button
          onClick={() => deleteFile(f.filename)}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          title="Delete File"
         >
          <Icons.Trash />
         </button>
        </div>
       </div>
      ))}
     </div>
    )}
   </div>
  </div>
 );
}
