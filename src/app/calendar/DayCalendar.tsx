// src/app/calendar/DayCalendar.tsx - Teams/Outlook Style Fixed Version
"use client";

import { useRef, useState, useCallback } from "react";
import {
  CalendarEvent,
  getMidnight,
  getMinutesSinceMidnight,
  setTimeOnDate,
} from "../utils/date-core";
import { formatTime, formatTimeRange } from "../utils/calendar-utils";

interface TimeSlot {
  start: Date;
  end: Date;
  minutes: number;
}

export default function DayCalendar({
  date,
  events,
  onCreate,
  onMove,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onCreate: (start: Date, end: Date) => void;
  onMove: (id: string, newStart: Date, newEnd: Date) => void;
  onEventClick?: (evt: CalendarEvent) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Constants for Teams/Outlook style
  const HOUR_HEIGHT = 48;
  const TIME_SLOT_DURATION = 30; // 30 minutes per slot
  const START_HOUR = 7; // 7 AM
  const END_HOUR = 19; // 7 PM
  const TOTAL_HOURS = END_HOUR - START_HOUR; // 12 hours
  const SLOTS_PER_HOUR = 60 / TIME_SLOT_DURATION; // 2 slots per hour
  const TOTAL_SLOTS = TOTAL_HOURS * SLOTS_PER_HOUR; // 24 slots total

  // Generate time slots (7 AM to 7 PM in 30-minute intervals)
  const generateTimeSlots = useCallback((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const baseDate = getMidnight(date);

    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const minutes = START_HOUR * 60 + i * TIME_SLOT_DURATION;
      const startTime = setTimeOnDate(
        baseDate,
        Math.floor(minutes / 60),
        minutes % 60
      );
      const endTime = setTimeOnDate(
        baseDate,
        Math.floor((minutes + TIME_SLOT_DURATION) / 60),
        (minutes + TIME_SLOT_DURATION) % 60
      );

      slots.push({
        start: startTime,
        end: endTime,
        minutes: minutes,
      });
    }
    return slots;
  }, [date]);

  const timeSlots = generateTimeSlots();

  // Handle time slot click (Teams/Outlook style double-click)
  const handleTimeSlotClick = useCallback(
    (slotIndex: number) => {
      const now = Date.now();
      const timeDiff = now - lastClickTime;

      if (
        timeDiff < 500 &&
        clickCount === 1 &&
        selectedTimeSlot === slotIndex
      ) {
        // Double click detected - open modal
        const slot = timeSlots[slotIndex];
        onCreate(slot.start, slot.end);
        setSelectedTimeSlot(null);
        setClickCount(0);
      } else {
        // First click - highlight slot
        setSelectedTimeSlot(slotIndex);
        setClickCount(1);
        setLastClickTime(now);

        // Clear selection after 2 seconds if no second click
        setTimeout(() => {
          setClickCount(0);
          if (selectedTimeSlot === slotIndex) {
            setSelectedTimeSlot(null);
          }
        }, 2000);
      }
    },
    [selectedTimeSlot, clickCount, lastClickTime, timeSlots, onCreate]
  );

  // Handle event click
  const handleEventClick = useCallback(
    (e: React.MouseEvent, evt: CalendarEvent) => {
      e.stopPropagation();
      onEventClick?.(evt);
    },
    [onEventClick]
  );

  // Generate hour labels
  const hourLabels = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
    const hourIndex = i + START_HOUR;
    const hour =
      hourIndex === 12 ? 12 : hourIndex > 12 ? hourIndex - 12 : hourIndex;
    const ampm = hourIndex < 12 ? "AM" : "PM";
    return `${hour} ${ampm}`;
  });

  // Convert minutes to Y position
  const minutesToY = useCallback((minutes: number): number => {
    const relativeMinutes = minutes - START_HOUR * 60;
    return (relativeMinutes / 60) * HOUR_HEIGHT;
  }, []);

  return (
    <div className="flex h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Time gutter */}
      <div
        className="w-16 bg-gray-50 border-r border-gray-200 flex-shrink-0"
        style={{ minWidth: "60px" }}
      >
        {hourLabels.map((hourLabel, i) => (
          <div
            key={i}
            className="text-xs text-gray-600 text-center py-1 border-b border-gray-100"
            style={{ height: HOUR_HEIGHT }}
          >
            {hourLabel}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
      >
        {/* Hour grid lines */}
        {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
          <div
            key={`hour-${i}`}
            className="absolute w-full border-b border-gray-200"
            style={{
              top: i * HOUR_HEIGHT,
              height: 1,
            }}
          />
        ))}

        {/* 30-minute grid lines */}
        {timeSlots.map((slot, i) => (
          <div
            key={`slot-${i}`}
            className={`absolute w-full border-b cursor-pointer transition-colors duration-150 ${
              selectedTimeSlot === i
                ? "bg-blue-100 border-blue-300"
                : "border-gray-100 hover:bg-gray-50"
            }`}
            style={{
              top: minutesToY(slot.minutes),
              height: HOUR_HEIGHT / SLOTS_PER_HOUR,
            }}
            onClick={() => handleTimeSlotClick(i)}
            title={formatTimeRange(slot.start, slot.end)}
          >
            {/* Time slot indicator */}
            <div className="absolute left-0 top-0 w-2 h-full bg-transparent group-hover:bg-blue-200" />

            {/* Selected slot highlight */}
            {selectedTimeSlot === i && (
              <div className="absolute inset-0 bg-blue-50 border-l-2 border-blue-500 flex items-center justify-center">
                <span className="text-xs text-blue-600 font-medium">
                  Click again to create appointment
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Events */}
        {events.map((evt) => {
          const startMin = getMinutesSinceMidnight(evt.start);
          const endMin = getMinutesSinceMidnight(evt.end);
          const duration = endMin - startMin;

          // Only show events within our time range
          if (startMin < START_HOUR * 60 || startMin >= END_HOUR * 60) {
            return null;
          }

          const top = minutesToY(startMin);
          const height = Math.max((duration / 60) * HOUR_HEIGHT, 20);

          return (
            <div
              key={evt.id}
              className="absolute left-1 right-1 bg-blue-500 text-white rounded px-2 py-1 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-150 z-10"
              style={{
                top: top,
                height: height,
              }}
              onClick={(e) => handleEventClick(e, evt)}
              title={`${evt.title} - ${formatTime(evt.start)}`}
            >
              <div className="text-xs font-medium truncate">{evt.title}</div>
              {height > 30 && (
                <div className="text-xs opacity-90 truncate">
                  {formatTime(evt.start)}
                </div>
              )}
            </div>
          );
        })}

        {/* Current time indicator (if today) */}
        {date.toDateString() === new Date().toDateString() &&
          (() => {
            const now = new Date();
            const currentMinutes = getMinutesSinceMidnight(now);
            if (
              currentMinutes >= START_HOUR * 60 &&
              currentMinutes < END_HOUR * 60
            ) {
              return (
                <div
                  className="absolute w-full border-t-2 border-red-500 z-20"
                  style={{
                    top: minutesToY(currentMinutes),
                  }}
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full -mt-1 -ml-1" />
                </div>
              );
            }
            return null;
          })()}
      </div>
    </div>
  );
}
