// src/app/calendar/AppointmentModal.tsx (updated)
"use client";

import { useEffect, useState } from "react";
import PatientSelect from "./PatientSelect";
import { createISOFromLocal, formatForDateTimeLocal } from "./timezone-utils";
import {
  debugDateInfo,
  fromDateTimeLocalString,
  toApiString,
  toDateTimeLocalString,
} from "./date-core";

export type AppointmentPayload = {
  title: string;
  startTime: string;
  endTime: string;
  patientId: string;
  fee?: number;
};

export default function AppointmentModal({
  open,
  onClose,
  defaultStart,
  defaultEnd,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  defaultStart: Date | null;
  defaultEnd: Date | null;
  onSubmit: (payload: AppointmentPayload) => void;
}) {
  const [title, setTitle] = useState("Consultation");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [patientId, setPatientId] = useState<string>("");
  const [fee, setFee] = useState<number | "">(80);

  useEffect(() => {
    if (open && defaultStart && defaultEnd) {
      debugDateInfo(defaultStart, "Modal Default Start");
      debugDateInfo(defaultEnd, "Modal Default End");

      setStart(toDateTimeLocalString(defaultStart));
      setEnd(toDateTimeLocalString(defaultEnd));
    }
  }, [open, defaultStart, defaultEnd]);

  if (!open) return null;

  const canSave = title.trim() && start && end && patientId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    // ✅ Updated: Use Single Source of Truth utilities
    const startDate = fromDateTimeLocalString(start);
    const endDate = fromDateTimeLocalString(end);

    debugDateInfo(startDate, "Submit Start");
    debugDateInfo(endDate, "Submit End");

    onSubmit({
      title,
      startTime: toApiString(startDate),
      endTime: toApiString(endDate),
      patientId,
      fee: fee === "" ? undefined : Number(fee),
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 z-10 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-strong">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">New Appointment</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
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
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-100"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition ${
                canSave
                  ? "bg-blue-700 hover:bg-primary-700 shadow-sm"
                  : "bg-blue-600 cursor-not-allowed"
              }`}
              disabled={!canSave}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
