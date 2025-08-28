// src/app/calendar/timezone-utils.ts
// Utility functions for handling timezone-safe date operations

/**
 * Create a Date object from API response (ISO string)
 * Safely handles timezone conversion
 */
export function createDateFromAPI(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Create a safe copy of a Date object
 * Prevents accidental mutations
 */
export function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

/**
 * Check if two dates are on the same day (local timezone)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get a date key for grouping events by day
 * Uses local timezone to avoid shifting
 */
export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeToLocalMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Parse an ISO “2025-08-28T14:00:00.000Z” string
 * into a Date that represents that same wall-clock local time.
 */
export function parseLocalISO(iso: string): Date {
  // Remove trailing Z and create a Date which interprets it in local zone
  const s = iso.endsWith("Z") ? iso.slice(0, -1) : iso;
  return new Date(s);
}

/**
 * Format a Date into a “yyyy-MM-ddTHH:mm” string
 * for datetime-local inputs (local zone).
 */
export function formatForDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Convert a local “yyyy-MM-ddTHH:mm” string back into
 * an exact UTC ISO timestamp.
 */
export function createISOFromLocal(datetimeLocal: string): string {
  // new Date(datetimeLocal) treats the string as local
  const d = new Date(datetimeLocal);
  return d.toISOString();
}
