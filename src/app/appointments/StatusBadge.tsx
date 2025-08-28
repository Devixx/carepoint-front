// src/app/appointments/StatusBadge.tsx
"use client";

export default function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  const cls = map[status ?? ""] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded px-2 py-1 text-xs ${cls}`}>{status ?? "—"}</span>
  );
}
