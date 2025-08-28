// src/app/calendar/WeekCalendar.tsx
"use client";

import DayCalendar from "./DayCalendar";

type EventItem = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patientId?: string;
  fee?: number;
};

export default function WeekCalendar({
  startOfWeek, // Monday
  eventsByDay,
  onCreate,
  onMove,
  onEventClick,
}: {
  startOfWeek: Date;
  eventsByDay: { date: Date; events: EventItem[] }[];
  onCreate: (day: Date, start: Date, end: Date) => void;
  onMove: (id: string, newStart: Date, newEnd: Date) => void;
  onEventClick?: (evt: EventItem) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {eventsByDay.map(({ date, events }) => (
        <div key={date.toDateString()}>
          <div className="mb-2 text-sm font-medium text-gray-700">
            {date.toLocaleDateString()}
          </div>
          <DayCalendar
            date={date}
            events={events}
            onCreate={(s, e) => onCreate(date, s, e)}
            onMove={onMove}
            onEventClick={onEventClick}
          />
        </div>
      ))}
    </div>
  );
}
