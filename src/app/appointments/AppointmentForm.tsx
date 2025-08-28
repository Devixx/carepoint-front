// src/app/appointments/AppointmentForm.tsx
"use client";
import Input from "../ui/primitives/Input";
import Button from "../ui/primitives/Button";
import { useState } from "react";
import { createISOFromLocal } from "../calendar/timezone-utils";

export type AppointmentFormValues = {
  title: string;
  startTime: string;
  endTime: string;
  patientId: string;
  fee?: number;
};

export default function AppointmentForm({
  onSubmit,
}: {
  onSubmit: (v: AppointmentFormValues) => void;
}) {
  const now = new Date();
  const startDefault = new Date(now.getTime() + 60 * 60 * 1000);
  const endDefault = new Date(startDefault.getTime() + 30 * 60 * 1000);

  const [title, setTitle] = useState("Consultation");
  const [start, setStart] = useState(startDefault.toISOString().slice(0, 16));
  const [end, setEnd] = useState(endDefault.toISOString().slice(0, 16));
  const [patientId, setPatientId] = useState("REPLACE_WITH_REAL_PATIENT_ID");
  const [fee, setFee] = useState<number | undefined>(80);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title,
          startTime: createISOFromLocal(start),
          endTime: createISOFromLocal(end),
          patientId,
          fee,
        });
      }}
    >
      <div>
        <label className="text-sm">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Start</label>
          <Input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm">End</label>
          <Input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm">Patient ID</label>
        <Input
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Hook this up to a real patient select next.
        </p>
      </div>
      <div>
        <label className="text-sm">Fee (€)</label>
        <Input
          type="number"
          value={fee ?? 0}
          onChange={(e) => setFee(parseFloat(e.target.value))}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            // duration presets: 30 minutes
            const s = new Date(start);
            const e = new Date(s.getTime() + 30 * 60 * 1000);
            setEnd(e.toISOString().slice(0, 16));
          }}
        >
          +30m
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const s = new Date(start);
            const e = new Date(s.getTime() + 60 * 60 * 1000);
            setEnd(e.toISOString().slice(0, 16));
          }}
        >
          +60m
        </Button>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
