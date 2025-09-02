// src/app/ui/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  LayoutGrid,
  Settings,
  Stethoscope,
} from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  {
    href: "/appointments/calendar/advanced",
    label: "Calendar",
    icon: Stethoscope,
  },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-soft">
      <div className="h-full flex flex-col">
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <div className="text-lg font-bold text-gray-900 leading-tight">
                CarePoint
              </div>
              <div className="text-xs text-gray-500">Lux practice manager</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                  active
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon
                  className={clsx(
                    "h-5 w-5",
                    active
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                <span className="font-medium text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 text-xs text-gray-500">
          v1.0.0 • Always light
        </div>
      </div>
    </aside>
  );
}
