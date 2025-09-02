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
import EventDetailsModal, {
  CalendarEventVM,
} from "../../../calendar/EventDetailsModal";
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
import {
  cloneDate,
  createDateFromAPI,
  getLocalDateKey,
  normalizeToLocalMidnight,
  parseLocalISO,
} from "../../../calendar/timezone-utils";
import { setTime } from "@/app/calendar/utils";
import {
  CalendarEvent,
  debugDateInfo,
  normalizeApiEvents,
  toApiString,
} from "@/app/calendar/date-core";

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

export default function AdvancedCalendarPage() {
  const [view, setView] = useState<View>("day");
  const [cursorDate, setCursorDate] = useState(new Date());
  const [slotStart, setSlotStart] = useState<Date | null>(null);
  const [slotEnd, setSlotEnd] = useState<Date | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<CalendarEventVM | null>(
    null
  );
  const [editEvent, setEditEvent] = useState<CalendarEventVM | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  // DAY data
  const dayKey = getLocalDateKey(cursorDate);
  const qDay = useQuery({
    queryKey: ["calendar-day", dayKey],
    queryFn: () => dayAppointments(dayKey),
  });
  const eventsDay = normalizeApiEvents(qDay.data ?? []);

  // WEEK data
  const weekDates = useMemo(
    () => getWeekDates(startOfISOWeek(cursorDate)),
    [cursorDate]
  );
  const weekData = weekDates.map((d) => {
    const key = getLocalDateKey(d);
    const q = useQuery({
      queryKey: ["calendar-day", key],
      queryFn: () => dayAppointments(key),
    });
    return {
      date: d,
      events: normalizeApiEvents(q.data ?? []),
    };
  });

  // MONTH data
  const monthStart = startOfMonth(cursorDate);
  const monthMatrix = buildMonthMatrix(monthStart);
  const eventsMonthMap: Record<string, CalendarEventVM[]> = {};
  monthMatrix.flat().forEach((d) => {
    const key = getLocalDateKey(d);
    const q = useQuery({
      queryKey: ["calendar-day", key],
      queryFn: () => dayAppointments(key),
    });
    eventsMonthMap[key] = normalizeApiEvents(q.data ?? []);
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
        startTime: toApiString(start), // ✅ Use Single Source of Truth
        endTime: toApiString(end), // ✅ Use Single Source of Truth
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-day"] }),
  });

  const updateMut = useMutation({
    mutationFn: (p: AppointmentEditPayload) =>
      updateAppointment(p.id, {
        title: p.title,
        startTime: p.startTime,
        endTime: p.endTime,
        patient: p.patient,
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

  // ✅ Handle event click - SIMPLIFIED with Single Source of Truth
  function handleEventClick(evt: CalendarEvent) {
    // Debug in development
    debugDateInfo(evt.start, "Event Click Start");
    debugDateInfo(evt.end, "Event Click End");

    // No cloning needed - data is already normalized and consistent
    setDetailsEvent(evt);
  }

  // ✅ Handle event move - SIMPLIFIED with Single Source of Truth
  function handleEventMove(id: string, newStart: Date, newEnd: Date) {
    debugDateInfo(newStart, "Move Start");
    debugDateInfo(newEnd, "Move End");

    moveMut.mutate({ id, start: newStart, end: newEnd });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <Card className="m-6 p-6 flex flex-col flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl font-semibold">Calendar</h1>{" "}
            <div className="mb-2 text-lg font-medium text-gray-700">
              {cursorDate.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center justify-between gap-2">
              <button onClick={goPrev} className="px-3 py-2 rounded border">
                &larr;
              </button>
              <button onClick={goToday} className="btn">
                Today
              </button>
              <button onClick={goNext} className="px-3 py-2 rounded border">
                &rarr;
              </button>
            </div>
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

          {view === "day" && (
            <DayCalendar
              date={cursorDate}
              events={eventsDay}
              minuteStep={15}
              onCreate={(start, end) => {
                const day = new Date(cursorDate.getTime());
                setSlotStart(start);
                setSlotEnd(end);
                setCursorDate(day);
              }}
              onMove={handleEventMove}
              onEventClick={handleEventClick}
            />
          )}

          {view === "week" && (
            <WeekCalendar
              startOfWeek={startOfISOWeek(cursorDate)}
              eventsByDay={weekData}
              onCreate={(day, start, end) => {
                const correctDay = new Date(day.getTime());
                setCursorDate(correctDay);
                setSlotStart(start);
                setSlotEnd(end);
              }}
              onMove={handleEventMove}
              onEventClick={handleEventClick}
            />
          )}

          {view === "month" && (
            <MonthCalendar
              monthStart={monthStart}
              weeks={monthMatrix}
              eventsMap={eventsMonthMap}
              onSelectDay={(day) => {
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

          <EventDetailsModal
            open={!!detailsEvent}
            event={detailsEvent}
            onClose={() => setDetailsEvent(null)}
            onEdit={(evt) => setEditEvent(evt)}
            onDelete={(evt) => setDeleteId(evt.id)}
          />

          <AppointmentEditModal
            open={!!editEvent}
            event={editEvent}
            onClose={() => setEditEvent(null)}
            onSubmit={(payload) => updateMut.mutate(payload)}
          />

          <ConfirmDialog
            open={!!deleteId}
            title="Delete Appointment?"
            description="Are you sure you want to delete this appointment?"
            onConfirm={() => {
              if (deleteId) deleteMut.mutate(deleteId);
            }}
            onCancel={() => setDeleteId(null)}
            danger
          />
        </Card>
      </div>
    </div>
  );
}
