// src/app/appointments/calendar/page.tsx
"use client";

import Sidebar from "../../ui/layout/Sidebar";
import Header from "../../ui/layout/Header";
import Card from "../../ui/primitives/Card";
import { useQuery } from "@tanstack/react-query";
import { dayAppointments } from "../../api/appointments";

export default function CalendarPage() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, isLoading } = useQuery({
    queryKey: ["calendar", today],
    queryFn: () => dayAppointments(today),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />

        <main className="p-8 space-y-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
            <p className="text-sm text-gray-500">Day view • {today}</p>
          </div>

          <Card>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : data?.length ? (
              <div className="space-y-3">
                {data.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between border-b last:border-0 py-2"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{a.title}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(a.startTime).toLocaleTimeString()} —{" "}
                        {new Date(a.endTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      {a.fee ? `${a.fee}€` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600 text-center">
                No appointments for today.
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
