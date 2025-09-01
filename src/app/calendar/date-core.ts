// src/app/calendar/date-core.ts
/**
 * Core date handling utilities - Single Source of Truth
 * All calendar components MUST use these utilities
 *
 * @author Senior Developer
 * @version 2.0.0 - Timezone Safe Architecture
 */

export interface ApiTimeSlot {
  id: string;
  title: string;
  startTime: string; // ISO string from API
  endTime: string; // ISO string from API
  patientId?: string;
  fee?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date; // Normalized Date object
  end: Date; // Normalized Date object
  patientId?: string;
  fee?: number;
  color?: string;
}

/**
 * Convert API response to normalized calendar event
 * This is the ONLY way to create events from API data
 */
export function normalizeApiEvent(apiEvent: ApiTimeSlot): CalendarEvent {
  return {
    id: apiEvent.id,
    title: apiEvent.title,
    start: new Date(apiEvent.startTime),
    end: new Date(apiEvent.endTime),
    patientId: apiEvent.patientId,
    fee: apiEvent.fee,
  };
}

/**
 * Convert multiple API events to normalized events
 */
export function normalizeApiEvents(apiEvents: ApiTimeSlot[]): CalendarEvent[] {
  return apiEvents.map(normalizeApiEvent);
}

/**
 * Create a safe copy of a Date object
 * Preserves exact timestamp and timezone behavior
 */
export function safeCloneDate(date: Date): Date {
  return new Date(date.getTime());
}

/**
 * Check if two dates represent the same calendar day
 */
export function isSameCalendarDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get a standardized date key for grouping events
 * Format: YYYY-MM-DD
 */
export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Create a Date at midnight for a given date
 */
export function getMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Set time on a date without mutation
 */
export function setTimeOnDate(
  date: Date,
  hours: number,
  minutes: number
): Date {
  const result = safeCloneDate(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Get minutes since midnight for a date
 */
export function getMinutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Convert a Date to ISO string for API submission
 */
export function toApiString(date: Date): string {
  return date.toISOString();
}

/**
 * Format date for datetime-local input
 */
export function toDateTimeLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Parse datetime-local input value to Date
 */
export function fromDateTimeLocalString(datetimeLocal: string): Date {
  return new Date(datetimeLocal);
}

/**
 * Validation utilities
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidTimeSlot(start: Date, end: Date): boolean {
  return isValidDate(start) && isValidDate(end) && start < end;
}

/**
 * Calendar-specific constants
 */
export const MINUTES_STEP = 15;
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 20;

/**
 * Clamp minutes to step intervals
 */
export function clampToStep(mins: number, step: number = MINUTES_STEP): number {
  return Math.round(mins / step) * step;
}

/**
 * Ensure minutes are within working day range
 */
export function withinDayRange(mins: number): number {
  return Math.max(DAY_START_HOUR * 60, Math.min(DAY_END_HOUR * 60, mins));
}

/**
 * Format minutes as time label (HH:MM)
 */
export function toTimeLabel(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Add minutes to a date without mutation
 */
export function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60000);
}

/**
 * Debug utilities - Remove in production
 */
export function debugDateInfo(date: Date, label: string = "Date"): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[${label}]`, {
      date: date.toString(),
      iso: date.toISOString(),
      local: date.toLocaleString(),
      timestamp: date.getTime(),
    });
  }
}
