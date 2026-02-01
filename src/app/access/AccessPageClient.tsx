"use client";

import { useEffect, useState } from "react";
import {
  ACCESS_HUB_DEFAULT_ROWS,
  ACCESS_HUB_STORAGE_KEY,
  type AccessHubRow,
  type AccessLevel,
} from "@/lib/accessHub";

function AccessPill({ level }: { level: AccessLevel }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset";
  if (level === "Owner Only") {
    return (
      <span className={`${base} bg-red-50 text-red-700 ring-red-200 print:bg-transparent`}>
        Owner
      </span>
    );
  }
  if (level === "Delegate") {
    return (
      <span className={`${base} bg-amber-50 text-amber-800 ring-amber-200 print:bg-transparent`}>
        Delegate
      </span>
    );
  }
  return (
    <span className={`${base} bg-emerald-50 text-emerald-800 ring-emerald-200 print:bg-transparent`}>
      Read-only
    </span>
  );
}

function isLink(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function safeParseRows(value: string | null): AccessHubRow[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    return parsed as AccessHubRow[];
  } catch {
    return null;
  }
}

export default function AccessPageClient({
  initialRows = ACCESS_HUB_DEFAULT_ROWS,
}: {
  initialRows?: AccessHubRow[];
}) {
  const [rows, setRows] = useState<AccessHubRow[]>(initialRows);

  useEffect(() => {
    const stored = safeParseRows(localStorage.getItem(ACCESS_HUB_STORAGE_KEY));
    if (stored) setRows(stored);
  }, []);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key !== ACCESS_HUB_STORAGE_KEY) return;
      const stored = safeParseRows(event.newValue);
      setRows(stored ?? initialRows);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [initialRows]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <style>{`
        @media print {
          html,
          body {
            background: #fff !important;
            color: #111 !important;
          }

          .print\\:no-shadow {
            box-shadow: none !important;
          }

          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }

          .print\\:no-hover:hover {
            background: transparent !important;
          }
        }
      `}</style>

      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Eva Paradis — Access &amp; Control Hub
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-600">
          Internal reference only. Passwords are not stored here. This page defines platform
          ownership, access rules, and revocation steps.
        </p>
      </header>

      <section className="mb-12 rounded-xl border border-gray-200 bg-white shadow-sm print:no-shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium">Platform Access Directory</h2>
          <p className="mt-1 text-sm text-gray-500">
            Keep actual credentials in the vault. Use this for ownership, access level, and rotation
            tracking.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="border-b border-gray-200">
                {[
                  "Platform",
                  "Login URL",
                  "Username",
                  "Password",
                  "2FA Method",
                  "2FA Destination",
                  "Access Level",
                  "Owner",
                  "Last Rotated",
                  "Notes",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm">
              {rows.map((r) => (
                <tr key={r.platform} className="hover:bg-gray-50 print:no-hover">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {r.platform}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {isLink(r.url) ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-gray-300 underline-offset-4"
                      >
                        {r.url}
                      </a>
                    ) : (
                      <span className="text-gray-500">{r.url}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-400"></td>
                  <td className="px-4 py-3 text-gray-400"></td>

                  <td className="px-4 py-3 text-gray-700">{r.twoFaMethod}</td>
                  <td className="px-4 py-3 text-gray-700">{r.twoFaDestination}</td>

                  <td className="px-4 py-3">
                    <AccessPill level={r.access} />
                  </td>

                  <td className="px-4 py-3 text-gray-700">{r.owner}</td>
                  <td className="px-4 py-3 text-gray-400"></td>
                  <td className="px-4 py-3 text-gray-500">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:no-shadow">
          <h2 className="text-lg font-medium mb-4">Sharing Rules</h2>

          <h3 className="text-sm font-semibold text-gray-800">Never share direct login</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
            <li>OnlyFans</li>
            <li>X / Instagram / TikTok</li>
            <li>TrafficJunky</li>
            <li>Pornhub / xHamster</li>
            <li>Domain Registrar</li>
            <li>Password Vault</li>
          </ul>

          <h3 className="mt-5 text-sm font-semibold text-gray-800">Delegate with restrictions</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
            <li>Reddit (posting only)</li>
            <li>Email platform (campaigns; no billing)</li>
            <li>SMS platform (content only)</li>
            <li>Analytics (read-only)</li>
            <li>Hosting (deploy only; no DNS)</li>
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:no-shadow">
          <h2 className="text-lg font-medium mb-4">Revocation Checklist</h2>

          <h3 className="text-sm font-semibold text-gray-800">Immediate</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
            <li>Remove user from password vault</li>
            <li>Revoke email + Google access</li>
            <li>Remove ad/traffic platform permissions</li>
            <li>Remove hosting + analytics permissions</li>
          </ul>

          <h3 className="mt-5 text-sm font-semibold text-gray-800">Always rotate</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
            <li>Password vault master password</li>
            <li>Email platform login</li>
            <li>SMS platform login</li>
            <li>TrafficJunky login</li>
          </ul>

          <h3 className="mt-5 text-sm font-semibold text-gray-800">Rotate if ever shared</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
            <li>OnlyFans</li>
            <li>X / Instagram / TikTok</li>
            <li>Reddit</li>
            <li>Pornhub</li>
            <li>xHamster</li>
          </ul>

          <p className="mt-4 text-xs text-gray-500">
            Print tip: Use browser print → “Background graphics” off (optional).
          </p>
        </section>
      </div>
    </main>
  );
}
