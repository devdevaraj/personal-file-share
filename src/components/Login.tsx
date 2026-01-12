import { FormEvent, useState } from 'react';
import axios from 'axios';

export default function Login({ onSuccess }: { onSuccess: () => void }) {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [err, setErr] = useState('');
 const [loading, setLoading] = useState(false);

 async function submit(e: FormEvent) {
  e.preventDefault();
  setErr('');
  setLoading(true);
  try {
   const resp = await axios.post('/api/user/login', { username, password });
   if (resp.data.success) {
    onSuccess();
   }
  } catch (error) {
   setErr('Invalid credentials');
  } finally {
   setLoading(false);
  }
 }

 return (
  <div className="max-w-md mx-auto">
   <form onSubmit={submit} className="space-y-6">
    <div>
     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
     <input
      value={username}
      onChange={e => setUsername(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
      placeholder="Enter username"
      required
     />
    </div>
    <div>
     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
     <input
      type="password"
      value={password}
      onChange={e => setPassword(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
      placeholder="Enter password"
      required
     />
    </div>

    {err && (
     <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      {err}
     </div>
    )}

    <button
     disabled={loading}
     className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
    >
     {loading ? (
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
     ) : 'Sign In'}
    </button>

    <div className="text-center">
     <p className="text-xs text-slate-400 dark:text-slate-500">
      Use the fixed credential from server .env
     </p>
    </div>
   </form>
  </div>
 );
}
