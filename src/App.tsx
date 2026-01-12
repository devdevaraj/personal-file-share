import { useEffect, useState } from 'react';
import axios from 'axios';
import Login from "./components/Login";
import Uploads from "./components/Uploads";
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

axios.defaults.baseURL = import.meta.env.DEV ? `http://localhost:${import.meta.env.VITE_PORT}` : location.origin;
axios.defaults.withCredentials = true;

function AppContent() {
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

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Initializing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-5xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-6 sm:p-10 transition-all duration-300">
        <header className="mb-8 text-center sm:text-left border-b border-slate-200 dark:border-slate-700 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              File Share
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
              Secure, simple, and fast file sharing.
            </p>
          </div>
          {authenticated && (
            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800">
              Authenticated Session
            </div>
          )}
        </header>

        <div className="transition-opacity duration-300 ease-in-out">
          {authenticated ? (
            <Uploads onLogout={() => setAuthenticated(false)} />
          ) : (
            <Login onSuccess={() => setAuthenticated(true)} />
          )}
        </div>
      </div>

      <footer className="mt-8 text-center text-slate-400 dark:text-slate-600 text-xs">
        &copy; {new Date().getFullYear()} Personal File Share. All rights reserved.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
