// src/app/appointments/calendar/advanced/page.tsx
"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../../ui/layout/Sidebar";
import Header from "../../../ui/layout/Header";
import Card from "../../../ui/primitives/Card";
import DayCalendar from "../../../calendar/DayCalendar";
import WeekCalendar from "../../../calendar/WeekCalendar";
import MonthCalendar from "../../../calendar/MonthCalendar";
import AppointmentModal, {
  AppointmentPayload,
} from "../../../calendar/AppointmentModal";
import AppointmentEditModal, {
  AppointmentEditPayload,
} from "../../../calendar/AppointmentEditModal";
import EventDetailsModal from "../../../calendar/EventDetailsModal";
import ConfirmDialog from "../../../ui/primitives/ConfirmDialog";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dayAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../../api/appointments";

import {
  startOfISOWeek,
  getWeekDates,
  startOfMonth,
  buildMonthMatrix,
} from "../../../calendar/date-helpers";

// API model coming from backend day endpoint
type ApiItem = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  patientId?: string;
  fee?: number;
};

type View = "day" | "week" | "month";

// Map API items to calendar event VM
function toEventModel(items: ApiItem[]) {
  return items.map((a) => ({
    id: a.id,
    title: a.title,
    start: new Date(a.startTime),
    end: new Date(a.endTime),
    patientId: a.patientId,
    fee: a.fee,
  }));
}

export default function AdvancedCalendarPage() {
  // View state
  const [view, setView] = useState<View>("day");
  const [cursorDate, setCursorDate] = useState(new Date());

  // Creation modal state (drag-to-create)
  const [slotStart, setSlotStart] = useState<Date | null>(null);
  const [slotEnd, setSlotEnd] = useState<Date | null>(null);

  // Details + Edit modal state
  const [detailsEvent, setDetailsEvent] = useState<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    patientId?: string;
    fee?: number;
  } | null>(null);

  const [editEvent, setEditEvent] = useState<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    patientId?: string;
    fee?: number;
  } | null>(null);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const qc = useQueryClient();

  // DAY data
  const dayKey = cursorDate.toISOString().slice(0, 10);
  const qDay = useQuery({
    queryKey: ["calendar-day", dayKey],
    queryFn: () => dayAppointments(dayKey),
  });
  const eventsDay = toEventModel(qDay.data ?? []);

  // WEEK data
  const weekDates = useMemo(
    () => getWeekDates(startOfISOWeek(cursorDate)),
    [cursorDate]
  );
  const weekQueries = weekDates.map((d) =>
    useQuery({
      queryKey: ["calendar-day", d.toISOString().slice(0, 10)],
      queryFn: () => dayAppointments(d.toISOString().slice(0, 10)),
    })
  );
  const eventsWeekByDay = weekDates.map((d, i) => ({
    date: d,
    events: toEventModel(weekQueries[i].data ?? []),
  }));

  // MONTH data — simple approach calling day endpoint for each visible day
  const monthStart = startOfMonth(cursorDate);
  const monthMatrix = buildMonthMatrix(monthStart);
  const eventsMonthMap: Record<string, ReturnType<typeof toEventModel>> = {};
  monthMatrix.flat().forEach((d) => {
    const key = d.toISOString().slice(0, 10);
    const q = useQuery({
      queryKey: ["calendar-day", key],
      queryFn: () => dayAppointments(key),
    });
    eventsMonthMap[key] = toEventModel(q.data ?? []);
  });

  // Mutations
  const createMut = useMutation({
    mutationFn: (p: AppointmentPayload) => createAppointment(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-day"] });
      setSlotStart(null);
      setSlotEnd(null);
    },
  });

  const moveMut = useMutation({
    mutationFn: ({ id, start, end }: { id: string; start: Date; end: Date }) =>
      updateAppointment(id, {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-day"] }),
  });

  const updateMut = useMutation({
    mutationFn: (p: AppointmentEditPayload) =>
      updateAppointment(p.id, {
        title: p.title,
        startTime: p.startTime,
        endTime: p.endTime,
        patientId: p.patientId,
        fee: p.fee,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-day"] });
      setEditEvent(null);
      setDetailsEvent(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-day"] });
      setDeleteId(null);
      setDetailsEvent(null);
    },
  });

  // Navigation
  function goPrev() {
    const d = new Date(cursorDate);
    if (view === "day") d.setDate(d.getDate() - 1);
    if (view === "week") d.setDate(d.getDate() - 7);
    if (view === "month") d.setMonth(d.getMonth() - 1);
    setCursorDate(d);
  }
  function goNext() {
    const d = new Date(cursorDate);
    if (view === "day") d.setDate(d.getDate() + 1);
    if (view === "week") d.setDate(d.getDate() + 7);
    if (view === "month") d.setMonth(d.getMonth() + 1);
    setCursorDate(d);
  }
  function goToday() {
    setCursorDate(new Date());
  }

  // When user clicks an event: open details modal
  function handleEventClick(evt: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    patientId?: string;
    fee?: number;
  }) {
    setDetailsEvent(evt);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-8 space-y-8">
          {/* Header: title, date context, controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
              <p className="text-sm text-gray-500">
                {view === "day" && cursorDate.toDateString()}
                {view === "week" &&
                  `Week of ${startOfISOWeek(cursorDate).toDateString()}`}
                {view === "month" &&
                  cursorDate.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded border" onClick={goPrev}>
                Prev
              </button>
              <button className="px-3 py-2 rounded border" onClick={goToday}>
                Today
              </button>
              <button className="px-3 py-2 rounded border" onClick={goNext}>
                Next
              </button>
              <div className="ml-2 flex rounded-lg border overflow-hidden">
                <button
                  className={`px-3 py-2 text-sm ${
                    view === "day" ? "bg-blue-700 text-white" : "bg-white"
                  }`}
                  onClick={() => setView("day")}
                >
                  Day
                </button>
                <button
                  className={`px-3 py-2 text-sm ${
                    view === "week" ? "bg-blue-700 text-white" : "bg-white"
                  }`}
                  onClick={() => setView("week")}
                >
                  Week
                </button>
                <button
                  className={`px-3 py-2 text-sm ${
                    view === "month" ? "bg-blue-700 text-white" : "bg-white"
                  }`}
                  onClick={() => setView("month")}
                >
                  Month
                </button>
              </div>
            </div>
          </div>

          {/* Views */}
          {view === "day" && (
            <Card padding={false}>
              <div className="p-4">
                <DayCalendar
                  date={cursorDate}
                  events={eventsDay}
                  onCreate={(start, end) => {
                    setSlotStart(start);
                    setSlotEnd(end);
                  }}
                  onMove={(id, ns, ne) =>
                    moveMut.mutate({ id, start: ns, end: ne })
                  }
                  onEventClick={(evt) => handleEventClick(evt)}
                />
              </div>
            </Card>
          )}

          {view === "week" && (
            <WeekCalendar
              startOfWeek={startOfISOWeek(cursorDate)}
              eventsByDay={eventsWeekByDay}
              onCreate={(_day, start, end) => {
                setSlotStart(start);
                setSlotEnd(end);
              }}
              onMove={(id, ns, ne) =>
                moveMut.mutate({ id, start: ns, end: ne })
              }
              onEventClick={(evt) => handleEventClick(evt)}
            />
          )}

          {view === "month" && (
            <MonthCalendar
              monthStart={monthStart}
              weeks={monthMatrix}
              eventsMap={eventsMonthMap}
              onSelectDay={(day) => {
                // Switch to day view and open a default slot (09:00–09:30)
                setView("day");
                setCursorDate(day);
                const s = new Date(day);
                s.setHours(9, 0, 0, 0);
                const e = new Date(day);
                e.setHours(9, 30, 0, 0);
                setSlotStart(s);
                setSlotEnd(e);
              }}
            />
          )}
        </main>
      </div>

      {/* Create modal (drag-to-create or from month day click) */}
      <AppointmentModal
        open={!!slotStart && !!slotEnd}
        onClose={() => {
          setSlotStart(null);
          setSlotEnd(null);
        }}
        defaultStart={slotStart}
        defaultEnd={slotEnd}
        onSubmit={(payload) => createMut.mutate(payload)}
      />

      {/* Event details modal (Edit/Delete entry point) */}
      <EventDetailsModal
        open={!!detailsEvent}
        event={detailsEvent}
        onClose={() => setDetailsEvent(null)}
        onEdit={(evt) => setEditEvent(evt)}
        onDelete={(evt) => setDeleteId(evt.id)}
      />

      {/* Edit modal */}
      <AppointmentEditModal
        open={!!editEvent}
        onClose={() => setEditEvent(null)}
        event={editEvent}
        onSubmit={(payload) => updateMut.mutate(payload)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete appointment"
        description="This action cannot be undone. Do you want to delete this appointment?"
        confirmText={deleteMut.isPending ? "Deleting…" : "Delete"}
        onConfirm={() => {
          if (deleteId) deleteMut.mutate(deleteId);
        }}
        onCancel={() => setDeleteId(null)}
        danger
      />
    </div>
  );
}
