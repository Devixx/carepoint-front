// ==============================
// src/app/api/appointments.ts
// Appointments API module
// ==============================
"use client";

import { http } from "../lib/http";
import { Patient } from "./patients";

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type?: "consultation" | "follow_up" | "routine_checkup";
  status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  patient: Patient;
  fee?: number;
  createdAt?: string;
  patientFullName?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: { total: number; page: number; limit: number };
}

export async function listAppointments(params: {
  page?: number;
  limit?: number;
}) {
  const res = await http.get<Paginated<Appointment>>("/appointments", {
    params,
  });
  return res.data;
}

export async function dayAppointments(date: string) {
  const res = await http.get<Appointment[]>(`/appointments/calendar/${date}`);
  return res.data;
}

export async function createAppointment(payload: Partial<Appointment>) {
  const res = await http.post<Appointment>("/appointments", payload);
  return res.data;
}

export async function updateAppointment(
  id: string,
  payload: Partial<Appointment>
) {
  const res = await http.patch<Appointment>(`/appointments/${id}`, payload);
  return res.data;
}

export async function deleteAppointment(id: string) {
  const res = await http.delete(`/appointments/${id}`);
  return res.data;
}
