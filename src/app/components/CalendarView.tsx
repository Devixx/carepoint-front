// ==============================
// src/app/components/CalendarView.tsx
// Simple day view using existing component filename
// ==============================
"use client";

import { useQuery } from "@tanstack/react-query";
import { dayAppointments } from "../api/appointments";

export default function CalendarView({ date }: { date: string }) {
  const q = useQuery({
    queryKey: ["calendar", date],
    queryFn: () => dayAppointments(date),
  });

  return (
    <div className="space-y-3">
      <div className="text-lg font-medium">Calendar for {date}</div>
      {q.isLoading && <div className="text-sm text-gray-500">Loading...</div>}
      <div className="space-y-2">
        {q.data?.map((a) => (
          <div key={a.id} className="border rounded p-3">
            <div className="font-medium">{a.title}</div>
            <div className="text-sm text-gray-600">
              {new Date(a.startTime).toLocaleTimeString()} —{" "}
              {new Date(a.endTime).toLocaleTimeString()}
            </div>
            <div className="text-sm">Status: {a.status ?? "—"}</div>
          </div>
        ))}
        {!q.data?.length && !q.isLoading && (
          <div className="text-sm text-gray-500">
            No appointments for this day.
          </div>
        )}
      </div>
    </div>
  );
}
