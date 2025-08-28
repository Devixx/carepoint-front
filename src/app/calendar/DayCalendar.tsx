// src/app/calendar/DayCalendar.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import {
  addMinutes,
  clampToStep,
  DAY_END_HOUR,
  DAY_START_HOUR,
  minutesSinceStartOfDay,
  setTime,
  toTimeLabel,
  withinDayRange,
} from "./utils";
import {
  createISOFromLocal,
  formatForDateTimeLocal,
  normalizeToLocalMidnight,
} from "./timezone-utils";

type EventItem = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patientId?: string;
  fee?: number;
  color?: string;
};

type DragState =
  | { type: "none" }
  | { type: "create"; startMin: number; endMin: number }
  | { type: "move"; eventId: string; grabOffsetMin: number };

export default function DayCalendar({
  date,
  events,
  onCreate,
  onMove,
  onEventClick, // NEW: open details modal
  minuteStep = 15,
}: {
  date: Date;
  events: EventItem[];
  onCreate: (start: Date, end: Date) => void;
  onMove: (id: string, newStart: Date, newEnd: Date) => void;
  onEventClick?: (evt: EventItem) => void;
  minuteStep?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState>({ type: "none" });

  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) arr.push(h);
    return arr;
  }, []);

  function yToMinutes(clientY: number) {
    const el = containerRef.current;
    if (!el) return DAY_START_HOUR * 60;
    const rect = el.getBoundingClientRect();
    const y = clientY - rect.top;
    const totalMins = (DAY_END_HOUR - DAY_START_HOUR) * 60;
    const minutePerPx = totalMins / el.clientHeight;
    const mins = DAY_START_HOUR * 60 + y * minutePerPx;
    return withinDayRange(clampToStep(mins, minuteStep));
  }

  function minutesToTopHeight(startMin: number, endMin: number) {
    const totalMins = (DAY_END_HOUR - DAY_START_HOUR) * 60;
    const startOffset = startMin - DAY_START_HOUR * 60;
    const heightMins = Math.max(endMin - startMin, minuteStep);
    return {
      topPct: (startOffset / totalMins) * 100,
      heightPct: (heightMins / totalMins) * 100,
    };
  }

  // Background interactions (create)
  function handleBackgroundMouseDown(e: React.MouseEvent) {
    const startMin = yToMinutes(e.clientY);
    setDrag({ type: "create", startMin, endMin: startMin + minuteStep });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (drag.type === "create") {
      const endMin = yToMinutes(e.clientY);
      const bounded = Math.max(endMin, drag.startMin + minuteStep);
      setDrag({ ...drag, endMin: bounded });
    }
    if (drag.type === "move") {
      // Visual feedback could be added, but final move happens on mouse up.
    }
  }

  function handleMouseUp() {
    if (drag.type === "create") {
      // Create a fresh Date at local midnight
      const base = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const start = setTime(
        base,
        Math.floor(drag.startMin / 60),
        drag.startMin % 60
      );
      const end = setTime(base, Math.floor(drag.endMin / 60), drag.endMin % 60);
      onCreate(start, end);
    }
    setDrag({ type: "none" });
  }

  // Event interactions (move & click)
  function onEventMouseDown(e: React.MouseEvent, eventId: string) {
    e.stopPropagation();
    const targetMin = yToMinutes(e.clientY);
    const evt = events.find((x) => x.id === eventId);
    if (!evt) return;
    const evtStartMin = minutesSinceStartOfDay(evt.start);
    const grabOffset = targetMin - evtStartMin;
    setDrag({ type: "move", eventId, grabOffsetMin: grabOffset });
  }

  function onEventMouseUp(e: React.MouseEvent, eventId: string) {
    e.stopPropagation();
    if (drag.type !== "move") return; // Not moving; click handled separately
    const currentMin = yToMinutes(e.clientY);
    const evt = events.find((x) => x.id === eventId);
    if (!evt) {
      setDrag({ type: "none" });
      return;
    }
    const duration =
      minutesSinceStartOfDay(evt.end) - minutesSinceStartOfDay(evt.start);
    const newStart = withinDayRange(currentMin - drag.grabOffsetMin);
    const newEnd = withinDayRange(newStart + duration);
    const start = setTime(date, Math.floor(newStart / 60), newStart % 60);
    const end = setTime(date, Math.floor(newEnd / 60), newEnd % 60);
    onMove(eventId, start, end);
    setDrag({ type: "none" });
  }

  function onEventClickInternal(e: React.MouseEvent, event: EventItem) {
    // Only handle click when not in a move drag
    if (drag.type !== "none") return;
    e.stopPropagation();
    onEventClick?.(event);
  }

  return (
    <div
      className="relative h-[900px] rounded-xl border border-gray-200 bg-white shadow-soft overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Time ruler */}
      <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-gray-100 bg-gray-50 text-xs text-gray-500">
        {hours.map((h) => (
          <div
            key={h}
            className="relative"
            style={{ height: `${100 / (DAY_END_HOUR - DAY_START_HOUR)}%` }}
          >
            <div className="absolute top-0 right-1 -translate-y-1/2">
              {toTimeLabel(h * 60)}
            </div>
            <div className="absolute top-1/2 right-1 -translate-y-1/2 text-[10px] text-gray-400">
              {toTimeLabel(h * 60 + 30)}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive grid */}
      <div
        ref={containerRef}
        className="absolute left-16 right-0 top-0 bottom-0 cursor-crosshair"
        onMouseDown={handleBackgroundMouseDown}
      >
        {/* hour grid */}
        {hours.map((h) => (
          <div
            key={h}
            className="relative border-b border-gray-100"
            style={{ height: `${100 / (DAY_END_HOUR - DAY_START_HOUR)}%` }}
          >
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-100" />
          </div>
        ))}

        {/* current time indicator */}
        {(() => {
          const now = new Date();
          const sameDay = now.toDateString() === date.toDateString();
          if (!sameDay) return null;
          const mins = minutesSinceStartOfDay(now);
          const total = (DAY_END_HOUR - DAY_START_HOUR) * 60;
          const top = ((mins - DAY_START_HOUR * 60) / total) * 100;
          return (
            <div
              className="pointer-events-none absolute left-0 right-0"
              style={{ top: `${top}%` }}
            >
              <div className="mx-2 h-[2px] bg-red-500" />
            </div>
          );
        })()}

        {/* existing events */}
        {events.map((evt) => {
          const startMin = minutesSinceStartOfDay(evt.start);
          const endMin = minutesSinceStartOfDay(evt.end);
          const { topPct, heightPct } = minutesToTopHeight(startMin, endMin);
          return (
            <div
              key={evt.id}
              onMouseDown={(e) => onEventMouseDown(e, evt.id)}
              onMouseUp={(e) => onEventMouseUp(e, evt.id)}
              onClick={(e) => onEventClickInternal(e, evt)}
              className="absolute left-2 right-2 rounded-lg border border-primary-200 bg-primary-50 text-primary-800 px-3 py-2 text-xs shadow-sm hover:shadow-md cursor-pointer"
              style={{ top: `${topPct}%`, height: `${heightPct}%` }}
            >
              <div className="font-medium text-[13px] leading-tight">
                {evt.title}
              </div>
              <div className="text-[11px] opacity-80">
                {evt.start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                —{" "}
                {evt.end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}

        {/* creation selection preview */}
        {drag.type === "create" &&
          (() => {
            const { topPct, heightPct } = minutesToTopHeight(
              drag.startMin,
              drag.endMin
            );
            return (
              <div
                className="absolute left-2 right-2 rounded-lg border border-blue-300 bg-blue-50/70"
                style={{ top: `${topPct}%`, height: `${heightPct}%` }}
              />
            );
          })()}
      </div>
    </div>
  );
}
