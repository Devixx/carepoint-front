// ==============================
// src/app/api/doctor-settings.ts
// Doctor Settings API module
// ==============================
"use client";

import { http } from "../lib/http";

export interface DoctorProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  // Social Media
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface WorkingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isAvailable: boolean;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  breakStartTime?: string; // HH:mm format
  breakEndTime?: string; // HH:mm format
}

export interface AppointmentSettings {
  defaultDuration: number; // in minutes
  defaultFee?: number;
  consultationTypes?: {
    type: string;
    duration: number;
    fee?: number;
  }[];
  timeSlotInterval?: number; // in minutes (e.g., 15, 30)
  advanceBookingDays?: number; // how many days in advance patients can book
  sameDayBooking?: boolean;
}

export interface Vacation {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  reason?: string;
}

export interface DoctorSettings {
  profile: DoctorProfile;
  workingHours: WorkingHours[];
  appointmentSettings: AppointmentSettings;
  vacations?: Vacation[];
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export { DAYS_OF_WEEK };

// Get doctor settings
export async function getDoctorSettings() {
  const res = await http.get<DoctorSettings>("/doctor/settings");
  return res.data;
}

// Update doctor profile
export async function updateDoctorProfile(profile: Partial<DoctorProfile>) {
  const res = await http.patch<DoctorProfile>("/doctor/profile", profile);
  return res.data;
}

// Update working hours
export async function updateWorkingHours(workingHours: WorkingHours[]) {
  const res = await http.patch<{ workingHours: WorkingHours[] }>(
    "/doctor/working-hours",
    { workingHours }
  );
  return res.data;
}

// Update appointment settings
export async function updateAppointmentSettings(
  settings: Partial<AppointmentSettings>
) {
  const res = await http.patch<AppointmentSettings>(
    "/doctor/appointment-settings",
    settings
  );
  return res.data;
}

// Update all settings at once
export async function updateDoctorSettings(settings: Partial<DoctorSettings>) {
  const res = await http.patch<DoctorSettings>("/doctor/settings", settings);
  return res.data;
}

