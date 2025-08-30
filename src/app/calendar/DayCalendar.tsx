// src/app/calendar/DayCalendar.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  setTime,
  minutesSinceStartOfDay,
  withinDayRange,
  clampToStep,
} from "./utils";
import type { EventItem } from "./WeekCalendar";
import { cloneDate } from "./timezone-utils";

interface DragStateNone {
  type: "none";
}
interface DragStateCreate {
  type: "create";
  startMin: number;
  endMin: number;
  isDragging: boolean;
}
interface DragStateMove {
  type: "move";
  eventId: string;
  grabOffsetMin: number;
  initialStartMin: number;
  currentStartMin: number;
  duration: number;
}

type DragState = DragStateNone | DragStateCreate | DragStateMove;

const HOUR_HEIGHT = 48; // Each hour = 48px for better visual spacing
const TIME_GUTTER_WIDTH = 60;

export default function DayCalendar({
  date,
  events,
  onCreate,
  onMove,
  onEventClick,
  minuteStep = 15,
}: {
  date: Date;
  events: EventItem[];
  onCreate: (start: Date, end: Date) => void;
  onMove: (id: string, newStart: Date, newEnd: Date) => void;
  onEventClick?: (evt: EventItem) => void;
  minuteStep?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState>({ type: "none" });
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState<number | null>(null);

  // Convert clientY to minutes since midnight
  const yToMinutes = useCallback(
    (clientY: number): number => {
      const container = containerRef.current;
      if (!container) return 0;

      const rect = container.getBoundingClientRect();
      const y = Math.max(0, clientY - rect.top);
      const minutes = (y / HOUR_HEIGHT) * 60;
      return clampToStep(Math.min(minutes, 24 * 60 - minuteStep), minuteStep);
    },
    [minuteStep]
  );

  // Convert minutes to Y position
  const minutesToY = useCallback((minutes: number): number => {
    return (minutes / 60) * HOUR_HEIGHT;
  }, []);

  // Handle background mouse events for creating new events
  const handleBackgroundMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (drag.type !== "none" || e.button !== 0) return;
      e.preventDefault();

      const startMin = yToMinutes(e.clientY);
      setDrag({
        type: "create",
        startMin,
        endMin: startMin + minuteStep,
        isDragging: true,
      });
    },
    [drag.type, yToMinutes, minuteStep]
  );

  // Handle event mouse down for moving
  const handleEventMouseDown = useCallback(
    (e: React.MouseEvent, eventId: string) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const evt = events.find((ev) => ev.id === eventId);
      if (!evt) return;

      const clickY = yToMinutes(e.clientY);
      const eventStartMin = minutesSinceStartOfDay(evt.start);
      const duration = minutesSinceStartOfDay(evt.end) - eventStartMin;

      setDrag({
        type: "move",
        eventId,
        grabOffsetMin: clickY - eventStartMin,
        initialStartMin: eventStartMin,
        currentStartMin: eventStartMin,
        duration,
      });
    },
    [events, yToMinutes]
  );

  // Global mouse handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (drag.type === "create") {
        const currentMin = yToMinutes(e.clientY);
        const endMin = Math.max(currentMin, drag.startMin + minuteStep);
        setDrag((prev) =>
          prev.type === "create" ? { ...prev, endMin } : prev
        );
      } else if (drag.type === "move") {
        const currentMin = yToMinutes(e.clientY);
        const newStartMin = withinDayRange(currentMin - drag.grabOffsetMin);
        setDrag((prev) =>
          prev.type === "move"
            ? { ...prev, currentStartMin: newStartMin }
            : prev
        );
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (drag.type === "create") {
        const { startMin, endMin } = drag;
        if (endMin > startMin) {
          const base = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          const start = setTime(base, Math.floor(startMin / 60), startMin % 60);
          const end = setTime(base, Math.floor(endMin / 60), endMin % 60);
          onCreate(start, end);
        }
      } else if (drag.type === "move") {
        const { eventId, currentStartMin, duration } = drag;
        const newEndMin = Math.min(currentStartMin + duration, 24 * 60);
        const base = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        const newStart = setTime(
          base,
          Math.floor(currentStartMin / 60),
          currentStartMin % 60
        );
        const newEnd = setTime(
          base,
          Math.floor(newEndMin / 60),
          newEndMin % 60
        );
        onMove(eventId, newStart, newEnd);
      }
      setDrag({ type: "none" });
    };

    if (drag.type !== "none") {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [drag, yToMinutes, minuteStep, date, onCreate, onMove]);

  // Handle event clicks
  const handleEventClick = useCallback(
    (e: React.MouseEvent, evt: EventItem) => {
      if (drag.type !== "none") return;
      e.stopPropagation();

      // Clone the event with proper local dates to prevent timezone shifts
      const clonedEvent = {
        ...evt,
        start: new Date(evt.start), // ✅ Use this instead
        end: new Date(evt.end),
      };
      onEventClick?.(clonedEvent);
    },
    [drag.type, onEventClick]
  );

  // Handle mouse enter/leave for time slot hover
  const handleTimeSlotHover = useCallback(
    (minutes: number | null) => {
      if (drag.type === "none") {
        setHoveredTimeSlot(minutes);
      }
    },
    [drag.type]
  );

  // Generate hour labels
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
    const ampm = i < 12 ? "AM" : "PM";
    return `${hour} ${ampm}`;
  });

  return (
    <div className="flex h-full bg-white">
      {/* Time gutter */}
      <div
        className="flex-shrink-0 bg-gray-50 border-r border-gray-200"
        style={{ width: TIME_GUTTER_WIDTH }}
      >
        {hours.map((hourLabel, i) => (
          <div
            key={i}
            className="relative text-xs text-gray-600 pr-2 text-right"
            style={{ height: HOUR_HEIGHT }}
          >
            <span className="absolute -top-2 right-2">{hourLabel}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-y-auto cursor-pointer"
        onMouseDown={handleBackgroundMouseDown}
        style={{ height: 24 * HOUR_HEIGHT }}
      >
        {/* Hour lines */}
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-gray-200"
            style={{ top: i * HOUR_HEIGHT }}
          />
        ))}

        {/* 15-minute indicators */}
        {Array.from({ length: 24 * 4 }).map((_, i) => {
          const minutes = i * 15;
          if (minutes % 60 === 0) return null; // Skip hour lines
          return (
            <div
              key={i}
              className="absolute left-0 w-2 border-t border-gray-100"
              style={{ top: minutesToY(minutes) }}
            />
          );
        })}

        {/* Hover indicator */}
        {hoveredTimeSlot !== null && drag.type === "none" && (
          <div
            className="absolute left-0 right-0 bg-blue-50 border border-blue-200 opacity-50"
            style={{
              top: minutesToY(hoveredTimeSlot),
              height: minutesToY(minuteStep),
            }}
          />
        )}

        {/* Creation preview */}
        {drag.type === "create" && (
          <div
            className="absolute left-1 right-1 bg-blue-200 border-2 border-blue-400 rounded opacity-80 flex items-center justify-center text-sm font-medium text-blue-800"
            style={{
              top: minutesToY(drag.startMin),
              height: Math.max(minutesToY(drag.endMin - drag.startMin), 20),
            }}
          >
            New Event
          </div>
        )}

        {/* Events */}
        {events.map((evt) => {
          let startMin = minutesSinceStartOfDay(evt.start);
          let duration = minutesSinceStartOfDay(evt.end) - startMin;

          // If this event is being dragged, use the drag position
          if (drag.type === "move" && drag.eventId === evt.id) {
            startMin = drag.currentStartMin;
          }

          const isDragging = drag.type === "move" && drag.eventId === evt.id;
          const top = minutesToY(startMin);
          const height = Math.max(minutesToY(duration), 20);

          return (
            <div
              key={evt.id}
              className={`
                absolute left-1 right-1 px-2 py-1 rounded shadow-sm text-xs cursor-pointer
                transition-all duration-150 select-none z-20 relative
                ${
                  isDragging
                    ? "bg-blue-300 border-2 border-blue-500 shadow-lg z-30 transform scale-105"
                    : "bg-blue-200 border border-blue-300 hover:bg-blue-250 hover:shadow-md"
                }
              `}
              style={{ top, height }}
              onMouseDown={(e) => handleEventMouseDown(e, evt.id)}
              onClick={(e) => handleEventClick(e, evt)}
              onMouseEnter={() => !isDragging && handleTimeSlotHover(startMin)}
              onMouseLeave={() => !isDragging && handleTimeSlotHover(null)}
            >
              <div className="font-medium text-blue-900 truncate">
                {evt.title}
              </div>
              {height > 30 && (
                <div className="text-blue-700 text-xs">
                  {new Date(evt.start).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Time slot hover areas */}
        {Array.from({ length: 24 * (60 / minuteStep) }).map((_, i) => {
          const minutes = i * minuteStep;
          return (
            <div
              key={i}
              className="absolute left-0 right-0 hover:bg-gray-50 z-0"
              style={{
                top: minutesToY(minutes),
                height: minutesToY(minuteStep),
              }}
              onMouseEnter={() => handleTimeSlotHover(minutes)}
              onMouseLeave={() => handleTimeSlotHover(null)}
            />
          );
        })}
      </div>
    </div>
  );
}
