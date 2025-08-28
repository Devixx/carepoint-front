// ==============================
// src/app/api/system.ts
// System/health endpoints
// ==============================
"use client";

import { http } from "../lib/http";

export async function health() {
  const res = await http.get<{ status: string }>("/health");
  return res.data;
}

export async function ready() {
  const res = await http.get<{ status: string }>("/ready");
  return res.data;
}

export async function info() {
  const res = await http.get<{
    name: string;
    version: string;
    commit: string;
    env: string;
  }>("/info");
  return res.data;
}
