// ==============================
// src/app/lib/http.ts
// Central Axios client
// ==============================
"use client";

import axios from "axios";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: false,
});

http.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);
