import { FormEvent, useState } from 'react';
import axios from 'axios';

export default function Login({ onSuccess }: { onSuccess: () => void }) {
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [err, setErr] = useState('');

 async function submit(e: FormEvent) {
  e.preventDefault();
  setErr('');
  try {
   const resp = await axios.post('/api/user/login', { username, password });
   if (resp.data.success) {
    onSuccess();
   }
  } catch (error) {
   setErr('Invalid credentials');
  }
 }

 return (
  <form onSubmit={submit} className="space-y-4">
   <div>
    <label className="block text-sm">Username</label>
    <input value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 rounded bg-slate-700" required />
   </div>
   <div>
    <label className="block text-sm">Password</label>
    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded bg-slate-700" required />
   </div>
   {err && <div className="text-rose-400">{err}</div>}
   <div className="flex items-center gap-3">
    <button className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600">Login</button>
   </div>
   <div className="text-sm text-slate-400">Use the fixed credential from server .env</div>
  </form>
 );
}
