// ==============================
// src/app/components/Dashboard.tsx
// Minimal dashboard (reuse your existing file if present)
// ==============================
"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <p className="text-gray-600">Quick links:</p>
      <div className="flex gap-3">
        <Link
          className="px-3 py-2 border rounded hover:bg-gray-50"
          href="/patients"
        >
          Patients
        </Link>
        <Link
          className="px-3 py-2 border rounded hover:bg-gray-50"
          href="/appointments"
        >
          Appointments
        </Link>
        <Link
          className="px-3 py-2 border rounded hover:bg-gray-50"
          href="/appointments/calendar"
        >
          Calendar
        </Link>
        <Link
          className="px-3 py-2 border rounded hover:bg-gray-50"
          href="/system"
        >
          System
        </Link>
      </div>
    </div>
  );
}
