/**
 * CENTRALIZED DATE UTILITY - SINGLE SOURCE OF TRUTH
 * 
 * All date conversions MUST go through this utility.
 * This ensures consistent timezone handling across the entire application.
 * 
 * Rules:
 * - API always expects/returns UTC ISO strings (e.g., "2025-11-11T15:00:00.000Z")
 * - UI displays dates in user's local timezone
 * - datetime-local inputs work in user's local timezone
 * 
 * @version 1.0.0 - Centralized Date Handling
 */

/**
 * Convert a datetime-local string (from HTML input) to UTC ISO string for API
 * 
 * @param datetimeLocal - String in format "YYYY-MM-DDTHH:mm" (local time)
 * @returns UTC ISO string (e.g., "2025-11-11T15:00:00.000Z")
 * 
 * @example
 * // User selects 16:00 in UTC+1 timezone
 * toApiDate("2025-11-11T16:00") // Returns "2025-11-11T15:00:00.000Z"
 */
export function toApiDate(datetimeLocal: string): string {
  if (!datetimeLocal) {
    throw new Error("datetimeLocal string is required");
  }
  
  // new Date() interprets datetime-local strings as local time
  // toISOString() converts to UTC
  const date = new Date(datetimeLocal);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime-local string: ${datetimeLocal}`);
  }
  
  return date.toISOString();
}

/**
 * Convert a UTC ISO string (from API) to datetime-local string for HTML input
 * 
 * @param isoString - UTC ISO string (e.g., "2025-11-11T15:00:00.000Z")
 * @returns datetime-local string (e.g., "2025-11-11T16:00") in user's local timezone
 * 
 * @example
 * // API returns 15:00 UTC
 * // User is in UTC+1 timezone
 * fromApiDate("2025-11-11T15:00:00.000Z") // Returns "2025-11-11T16:00"
 */
export function fromApiDate(isoString: string): string {
  if (!isoString) {
    throw new Error("ISO string is required");
  }
  
  const date = new Date(isoString);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO string: ${isoString}`);
  }
  
  // Format as datetime-local (YYYY-MM-DDTHH:mm) in local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Convert a UTC ISO string (from API) to a Date object
 * 
 * @param isoString - UTC ISO string (e.g., "2025-11-11T15:00:00.000Z")
 * @returns Date object
 */
export function parseApiDate(isoString: string): Date {
  if (!isoString) {
    throw new Error("ISO string is required");
  }
  
  const date = new Date(isoString);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO string: ${isoString}`);
  }
  
  return date;
}

/**
 * Convert a Date object to UTC ISO string for API
 * 
 * @param date - Date object
 * @returns UTC ISO string (e.g., "2025-11-11T15:00:00.000Z")
 */
export function dateToApi(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Valid Date object is required");
  }
  
  return date.toISOString();
}

/**
 * Format a Date object for datetime-local input
 * 
 * @param date - Date object
 * @returns datetime-local string (e.g., "2025-11-11T16:00")
 */
export function dateToLocalInput(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Valid Date object is required");
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Get a date key (YYYY-MM-DD) from a Date object in local timezone
 * Used for grouping events by day
 * 
 * @param date - Date object
 * @returns Date key string (e.g., "2025-11-11")
 */
export function getDateKey(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Valid Date object is required");
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Get a date key (YYYY-MM-DD) from a UTC ISO string
 * Uses LOCAL date components (for calendar consistency)
 * 
 * ⚠️ IMPORTANT: This uses LOCAL timezone to match calendar queries!
 * When API returns "2025-11-09T16:00:00.000Z" and user is in UTC+1,
 * this returns "2025-11-09" (the local date where the appointment will be displayed)
 * 
 * @param isoString - UTC ISO string from API
 * @returns Date key string in local timezone (e.g., "2025-11-11")
 */
export function getDateKeyFromApi(isoString: string): string {
  const date = parseApiDate(isoString);
  // Use LOCAL date components to match calendar queries which also use local dates
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object for display (local timezone)
 * 
 * @param date - Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateForDisplay(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Valid Date object is required");
  }
  
  return date.toLocaleString(undefined, options);
}

/**
 * Format time for display (local timezone)
 * 
 * @param date - Date object
 * @returns Time string (e.g., "16:00")
 */
export function formatTimeForDisplay(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Valid Date object is required");
  }
  
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  
  return `${hour}:${minute}`;
}

/**
 * Debug helper - Log date conversion details
 * Only logs in development mode
 */
export function debugDateConversion(
  label: string,
  datetimeLocal?: string,
  isoString?: string,
  date?: Date
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  
  console.log(`[Date Conversion: ${label}]`, {
    datetimeLocal,
    isoString,
    date: date ? {
      local: date.toLocaleString(),
      iso: date.toISOString(),
      timestamp: date.getTime(),
      timezoneOffset: date.getTimezoneOffset(),
    } : undefined,
  });
}

