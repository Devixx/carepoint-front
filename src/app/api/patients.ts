// ==============================
// src/app/api/patients.ts
// Patients API module
// ==============================
"use client";

import { http } from "../lib/http";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  medicalHistory?: string;
  createdAt?: string;
  label: string; // For select display
}

export interface Paginated<T> {
  items: T[];
  meta: { total: number; page: number; limit: number };
}

export async function listPatients(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const res = await http.get<Paginated<Patient>>("/clients", { params });
  return res.data;
}

export async function createPatient(payload: Partial<Patient>) {
  const res = await http.post<Patient>("/clients", payload);
  return res.data;
}

export async function updatePatient(id: string, payload: Partial<Patient>) {
  const res = await http.patch<Patient>(`/clients/${id}`, payload);
  return res.data;
}

export async function deletePatient(id: string) {
  const res = await http.delete(`/clients/${id}`);
  return res.data;
}
