// src/app/ui/layout/Header.tsx
"use client";

import { Bell, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              className="w-full rounded-lg border border-gray-200 pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              placeholder="Search patients, appointments..."
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/patients"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" /> New Patient
          </Link>
          <Link
            href="/appointments"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 text-white px-3 py-2 text-sm hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Appointment
          </Link>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 pl-2">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium text-gray-900">
                Dr. Sarah Wilson
              </div>
              <div className="text-xs text-gray-500">Cardiologist</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-semibold">
              SW
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
