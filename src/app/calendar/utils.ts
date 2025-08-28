// src/app/calendar/utils.ts
export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
};

export const MINUTES_STEP = 15;
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 20;

export function minutesSinceStartOfDay(d: Date) {
  const dt = new Date(d);
  dt.setSeconds(0, 0);
  return dt.getHours() * 60 + dt.getMinutes();
}

export function clampToStep(mins: number, step = MINUTES_STEP) {
  return Math.round(mins / step) * step;
}

export function toTimeLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function addMinutes(date: Date, mins: number) {
  return new Date(date.getTime() + mins * 60000);
}

export function setTime(date: Date, hours: number, minutes: number) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function withinDayRange(mins: number) {
  return Math.max(DAY_START_HOUR * 60, Math.min(DAY_END_HOUR * 60, mins));
}
