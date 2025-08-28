// src/app/page.tsx
import Sidebar from "./ui/layout/Sidebar";
import Header from "./ui/layout/Header";
import MetricCard from "./ui/MetricCard";
import Card from "./ui/primitives/Card";
import { CalendarDays, Users, Activity, Clock } from "lucide-react";
import Shortcut from "./ui/Shortcut";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <Shortcut />
        <main className="p-8 space-y-8">
          {/* KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <MetricCard
              label="Today’s Appointments"
              value="18"
              trend="+3 since yesterday"
              icon={<CalendarDays className="w-6 h-6" />}
            />
            <MetricCard
              label="Active Patients"
              value="1,245"
              trend="+12 this week"
              icon={<Users className="w-6 h-6" />}
            />
            <MetricCard
              label="Utilization"
              value="86%"
              trend="+4% this month"
              icon={<Activity className="w-6 h-6" />}
            />
            <MetricCard
              label="Avg. Wait Time"
              value="07m 45s"
              trend="-1m today"
              icon={<Clock className="w-6 h-6" />}
            />
          </div>

          {/* Two-column content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Upcoming appointments */}
            <Card className="xl:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Upcoming Appointments
                </h2>
                <a
                  href="/appointments"
                  className="text-sm text-primary-600 hover:underline"
                >
                  View all
                </a>
              </div>
              <div className="mt-4 divide-y divide-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        Consultation with John Doe
                      </div>
                      <div className="text-sm text-gray-500">
                        Today • 14:00–14:30 • Room A
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick actions */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <a
                  href="/patients"
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm hover:bg-gray-50"
                >
                  New Patient
                </a>
                <a
                  href="/appointments"
                  className="rounded-lg bg-blue-700 text-white px-4 py-3 text-sm hover:bg-blue-700"
                >
                  New Appointment
                </a>
                <a
                  href="/appointments/calendar"
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm hover:bg-gray-50"
                >
                  Open Calendar
                </a>
                <a
                  href="/system"
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm hover:bg-gray-50"
                >
                  System Status
                </a>
              </div>
              <div className="mt-6 text-xs text-gray-500">
                Tip: Press “N” to open “New Appointment” from anywhere.
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
