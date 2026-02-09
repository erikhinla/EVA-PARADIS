"use client";

import { useEffect, useState } from "react";

const DASHBOARD_PASSWORD = "eva2026";
const STORAGE_KEY = "dashboard_access_v1";

export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "granted") {
      setAuthorized(true);
    }
  }, []);

  if (authorized) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-neutral-800 bg-neutral-900/80 p-6">
        <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">
          Command Center
        </h1>
        <p className="mt-3 text-xs text-neutral-400">
          Enter the access password to continue.
        </p>

        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (password.trim() === DASHBOARD_PASSWORD) {
              sessionStorage.setItem(STORAGE_KEY, "granted");
              setAuthorized(true);
              setError("");
              return;
            }
            setError("Incorrect password. Try again.");
          }}
        >
          <input
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-400 focus:outline-none"
            placeholder="Password"
            autoComplete="current-password"
          />
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <button
            type="submit"
            className="w-full border border-emerald-500 bg-emerald-500/10 py-2 text-xs font-bold uppercase tracking-[0.3em] text-emerald-200 transition-colors hover:bg-emerald-500 hover:text-black"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
