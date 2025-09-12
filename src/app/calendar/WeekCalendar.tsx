"use client";

import DayCalendar from "./DayCalendar";

export type EventItem = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patientId?: string;
  docterId?: string;
  fee?: number;
  color?: string;
};

export default function WeekCalendar({
  startOfWeek,
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
    <div className="grid grid-cols-5 gap-2px bg-gray-200">
      {eventsByDay.map(({ date, events }) => (
        <div key={date.toISOString()} className="bg-white">
          <div className="p-5 bg-gray-50 text-center font-medium">
            {date.toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
            })}
          </div>
          <DayCalendar
            date={date}
            events={events}
            minuteStep={15}
            onCreate={(start, end) => {
              onCreate(date, start, end);
            }}
            onMove={onMove}
            onEventClick={onEventClick}
          />
        </div>
      ))}
    </div>
  );
}
