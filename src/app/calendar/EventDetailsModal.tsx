// src/app/calendar/EventDetailsModal.tsx
"use client";

import { useEffect } from "react";
import { formatForDateTimeLocal } from "./timezone-utils";
import {
  CalendarEvent,
  debugDateInfo,
  toDateTimeLocalString,
} from "./date-core";

export type CalendarEventVM = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patientId?: string;
  fee?: number;
};

export default function EventDetailsModal({
  open,
  event,
  onClose,
  onEdit,
  onDelete,
}: {
  open: boolean;
  event: CalendarEvent | null; // ✅ Updated: Use CalendarEvent type
  onClose: () => void;
  onEdit: (evt: CalendarEvent) => void; // ✅ Updated: Use CalendarEvent type
  onDelete: (evt: CalendarEvent) => void; // ✅ Updated: Use CalendarEvent type
}) {
  // ✅ Debug logging in development
  useEffect(() => {
    if (open && event) {
      debugDateInfo(event.start, "Details Modal Start");
      debugDateInfo(event.end, "Details Modal End");
    }
  }, [open, event]);
  if (!open || !event) return null;

  // Format for display in the modal:
  const startLocal = toDateTimeLocalString(event.start);
  const endLocal = toDateTimeLocalString(event.end);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 z-10 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-strong">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Appointment Details</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Title:</span>{" "}
            <span className="font-medium text-gray-900">{event.title}</span>
          </div>
          <div>
            <span className="text-gray-500">Start:</span>{" "}
            <span className="text-gray-900">{startLocal}</span>
          </div>
          <div>
            <span className="text-gray-500">End:</span>{" "}
            <span className="text-gray-900">{endLocal}</span>
          </div>
          <div>
            <span className="text-gray-500">Patient:</span>{" "}
            <span className="text-gray-900">{event.patientId ?? "—"}</span>
          </div>
          <div>
            <span className="text-gray-500">Fee:</span>{" "}
            <span className="text-gray-900">
              {event.fee != null ? `${event.fee}€` : "—"}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-primary-700"
            onClick={() => onEdit(event)}
          >
            Edit
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            onClick={() => onDelete(event)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
