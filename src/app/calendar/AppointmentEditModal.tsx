// src/app/calendar/AppointmentEditModal.tsx
"use client";

import { useEffect, useState } from "react";
import PatientSelect from "./PatientSelect";

export type AppointmentEditPayload = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  patientId: string;
  fee?: number;
};

export default function AppointmentEditModal({
  open,
  onClose,
  event,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    patientId?: string;
    fee?: number;
  } | null;
  onSubmit: (payload: AppointmentEditPayload) => void;
}) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [patientId, setPatientId] = useState<string>("");
  const [fee, setFee] = useState<number | "">("");

  useEffect(() => {
    if (open && event) {
      setTitle(event.title);
      setStart(event.start.toISOString().slice(0, 16));
      setEnd(event.end.toISOString().slice(0, 16));
      setPatientId(event.patientId ?? "");
      setFee(event.fee ?? "");
    }
  }, [open, event]);

  if (!open || !event) return null;

  const canSave = title.trim() && start && end && patientId.trim();

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 z-10 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-strong">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Appointment</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSave) return;
            onSubmit({
              id: event.id,
              title,
              startTime: new Date(start).toISOString(),
              endTime: new Date(end).toISOString(),
              patientId,
              fee: fee === "" ? undefined : Number(fee),
            });
          }}
        >
          <div>
            <label className="text-sm">Title</label>
            <input
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Start</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm">End</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm block mb-1">Patient</label>
            <PatientSelect value={patientId} onChange={setPatientId} />
          </div>

          <div>
            <label className="text-sm">Fee (€)</label>
            <input
              type="number"
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              value={fee}
              onChange={(e) =>
                setFee(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white transition ${
                canSave
                  ? "bg-blue-700 hover:bg-primary-700"
                  : "bg-blue-600 cursor-not-allowed"
              }`}
              disabled={!canSave}
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
