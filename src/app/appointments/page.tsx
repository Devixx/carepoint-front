// src/app/appointments/page.tsx
"use client";

import Sidebar from "../ui/layout/Sidebar";
import Header from "../ui/layout/Header";
import Card from "../ui/primitives/Card";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAppointment, listAppointments } from "../api/appointments";
import { CalendarPlus } from "lucide-react";

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-50 text-green-700 border-green-200",
    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-gray-50 text-gray-700 border-gray-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  const cls = map[status ?? ""] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

export default function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [openCreate, setOpenCreate] = useState(false);

  const qc = useQueryClient();
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["appointments", { page, limit }],
    queryFn: () => listAppointments({ page, limit }),
    keepPreviousData: true,
  });

  const createMut = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      setOpenCreate(false);
    },
  });

  const rows = useMemo(
    () =>
      (data?.items ?? []).map((a) => (
        <div key={a.id} className="py-3 flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">{a.title}</div>
            <div className="text-sm text-gray-500">
              {new Date(a.startTime).toLocaleString()} —{" "}
              {new Date(a.endTime).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={a.status} />
            <div className="text-sm text-gray-700">
              {a.fee ? `${a.fee}€` : "—"}
            </div>
          </div>
        </div>
      )),
    [data]
  );

  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />

        <main className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Appointments
              </h1>
              <p className="text-sm text-gray-500">
                Review and manage appointments
              </p>
            </div>
            <button
              onClick={() => setOpenCreate(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 text-white px-4 py-2 text-sm hover:bg-blue-700"
            >
              <CalendarPlus className="h-4 w-4" /> New Appointment
            </button>
          </div>

          <Card>
            {error && (
              <div className="text-red-600">Failed to load appointments.</div>
            )}

            {isLoading || isFetching ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : data?.items?.length ? (
              <div className="divide-y divide-gray-100">{rows}</div>
            ) : (
              <div className="text-center text-gray-600">
                No appointments found.
              </div>
            )}
          </Card>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Total: {total} • Page {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Create appointment modal (simple) */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenCreate(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-strong p-6">
            <h3 className="text-lg font-semibold mb-4">New Appointment</h3>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const data = new FormData(form);
                const start = new Date().toISOString();
                const end = new Date(Date.now() + 30 * 60 * 1000).toISOString();
                createMut.mutate({
                  title: String(data.get("title") || "Consultation"),
                  startTime: String(data.get("startTime") || start),
                  endTime: String(data.get("endTime") || end),
                  patientId: String(
                    data.get("patientId") || "REPLACE_WITH_REAL_PATIENT_ID"
                  ),
                  fee: Number(data.get("fee") || 80),
                });
              }}
            >
              <div>
                <label className="text-sm">Title</label>
                <input
                  name="title"
                  className="w-full mt-1 rounded border border-gray-200 px-3 py-2 text-sm"
                  defaultValue="Consultation"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Start</label>
                  <input
                    name="startTime"
                    type="datetime-local"
                    className="w-full mt-1 rounded border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm">End</label>
                  <input
                    name="endTime"
                    type="datetime-local"
                    className="w-full mt-1 rounded border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm">Patient ID</label>
                <input
                  name="patientId"
                  className="w-full mt-1 rounded border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm">Fee (€)</label>
                <input
                  name="fee"
                  type="number"
                  className="w-full mt-1 rounded border border-gray-200 px-3 py-2 text-sm"
                  defaultValue={80}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
