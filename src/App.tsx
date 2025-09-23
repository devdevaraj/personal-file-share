import { useEffect, useState } from 'react';
import axios from 'axios';
import Login from "./components/Login";
import Uploads from "./components/Uploads";

axios.defaults.baseURL = import.meta.env.DEV ? `http://localhost:${import.meta.env.VITE_PORT}` : location.origin;
axios.defaults.withCredentials = true;

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await axios.get('/api/user/me');
        setAuthenticated(!!resp.data.authenticated);
      } catch (e) {
        setAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  if (!authChecked) return <div className="p-6">Checking...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-slate-800 rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Simple File Share</h1>

        {authenticated ? (
          <Uploads onLogout={() => setAuthenticated(false)} />
        ) : (
          <Login onSuccess={() => setAuthenticated(true)} />
        )}
      </div>
    </div>
  );
}
