// Updated: src/app/page.tsx - Real Data Dashboard
"use client";

import { useQuery } from "@tanstack/react-query";
import Sidebar from "./ui/layout/Sidebar";
import Header from "./ui/layout/Header";
import MetricCard from "./ui/MetricCard";
import Card from "./ui/primitives/Card";
import {
  CalendarDays,
  Users,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Calendar,
  User,
  Stethoscope,
  Plus,
} from "lucide-react";
import Shortcut from "./ui/Shortcut";
import { listPatients } from "./api/patients";
import { listAppointments, dayAppointments } from "./api/appointments";
import { useEffect, useState } from "react";
import Link from "next/link";

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateKey = () => new Date().toISOString().slice(0, 10);

// Helper function to get this week's date range
const getThisWeekRange = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return { startOfWeek, endOfWeek };
};

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch total patients
  const {
    data: patientsData,
    isLoading: patientsLoading,
    error: patientsError,
  } = useQuery({
    queryKey: ["dashboard-patients"],
    queryFn: () => listPatients({ page: 1, limit: 1 }), // Just need total count
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch total appointments
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useQuery({
    queryKey: ["dashboard-appointments"],
    queryFn: () => listAppointments({ page: 1, limit: 1 }), // Just need total count
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch today's appointments
  const {
    data: todayAppointments,
    isLoading: todayLoading,
    error: todayError,
  } = useQuery({
    queryKey: ["dashboard-today", getTodayDateKey()],
    queryFn: () => dayAppointments(getTodayDateKey()),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1, // 1 minute (more frequent for today's schedule)
  });

  // Fetch upcoming appointments (next few days)
  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ["dashboard-upcoming"],
    queryFn: () => listAppointments({ page: 1, limit: 8 }),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Calculate metrics
  const totalPatients = patientsData?.meta?.total || 0;
  const totalAppointments = appointmentsData?.meta?.total || 0;
  const todayCount = todayAppointments?.length || 0;

  // Calculate this week's appointments
  const thisWeekCount =
    upcomingData?.items?.filter((appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      const { startOfWeek, endOfWeek } = getThisWeekRange();
      return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
    }).length || 0;

  // Get next few appointments
  const nextAppointments = upcomingData?.items?.slice(0, 6) || [];

  // Format appointment time
  const formatAppointmentTime = (appointment: any) => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let dateLabel;
    if (start.toDateString() === today.toDateString()) {
      dateLabel = "Today";
    } else if (start.toDateString() === tomorrow.toDateString()) {
      dateLabel = "Tomorrow";
    } else {
      dateLabel = start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    const timeRange = `${start.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}–${end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;

    return { dateLabel, timeRange };
  };

  // Get status styling
  const getStatusStyling = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Good{" "}
              {currentTime.getHours() < 12
                ? "morning"
                : currentTime.getHours() < 17
                ? "afternoon"
                : "evening"}
              ! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s what&apos;s happening at your practice today,{" "}
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              label="Total Patients"
              value={
                patientsLoading
                  ? "..."
                  : patientsError
                  ? "Error"
                  : totalPatients.toLocaleString()
              }
              trend={
                patientsLoading ? undefined : `${totalPatients} registered`
              }
              icon={<Users className="w-5 h-5 text-blue-600" />}
            />
            <MetricCard
              label="Total Appointments"
              value={
                appointmentsLoading
                  ? "..."
                  : appointmentsError
                  ? "Error"
                  : totalAppointments.toLocaleString()
              }
              trend={
                appointmentsLoading
                  ? undefined
                  : `${totalAppointments} scheduled`
              }
              icon={<CalendarDays className="w-5 h-5 text-green-600" />}
            />
            <MetricCard
              label="Today's Schedule"
              value={todayLoading ? "..." : todayError ? "Error" : todayCount}
              trend={
                todayLoading ? undefined : `${todayCount} appointments today`
              }
              icon={<Activity className="w-5 h-5 text-purple-600" />}
            />
            <MetricCard
              label="This Week"
              value={upcomingLoading ? "..." : thisWeekCount}
              trend={
                upcomingLoading
                  ? undefined
                  : `${thisWeekCount} appointments this week`
              }
              icon={<Clock className="w-5 h-5 text-orange-600" />}
            />
          </div>

          {/* Two-column content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming appointments */}
            <div className="lg:col-span-2">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Upcoming Appointments
                    </h2>
                    <Link
                      href="/appointments"
                      className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center"
                    >
                      View all <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {upcomingLoading ? (
                      // Loading state
                      Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse"
                        >
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="w-16 h-6 bg-gray-200 rounded"></div>
                        </div>
                      ))
                    ) : nextAppointments.length > 0 ? (
                      nextAppointments.map((appointment, i) => {
                        const { dateLabel, timeRange } =
                          formatAppointmentTime(appointment);
                        const patientName = appointment.patient
                          ? `${appointment.patient.firstName || ""} ${
                              appointment.patient.lastName || ""
                            }`.trim()
                          : "Unknown Patient";

                        return (
                          <div
                            key={appointment.id}
                            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {appointment.title} with {patientName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {dateLabel} • {timeRange}
                                {appointment.type && (
                                  <span className="ml-2 capitalize">
                                    • {appointment.type.replace("_", " ")}
                                  </span>
                                )}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyling(
                                appointment.status || "pending"
                              )}`}
                            >
                              {appointment.status?.replace("_", " ") ||
                                "Pending"}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No upcoming appointments
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Your schedule is clear. Time to focus on other tasks!
                        </p>
                        <Link
                          href="/appointments"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Schedule Appointment
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick actions & Today's Summary */}
            <div className="space-y-6">
              {/* Today's Summary */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Today&apos;s Summary
                  </h3>

                  {todayLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  ) : todayError ? (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm">
                        Failed to load today&apos;s schedule
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Total Appointments
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          {todayCount}
                        </span>
                      </div>

                      {todayCount > 0 && (
                        <>
                          <div className="border-t border-gray-200 pt-4">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                              Status Breakdown
                            </div>
                            <div className="space-y-2">
                              {["confirmed", "pending", "completed"].map(
                                (status) => {
                                  const count =
                                    todayAppointments?.filter(
                                      (apt) => apt.status === status
                                    ).length || 0;
                                  if (count === 0) return null;

                                  return (
                                    <div
                                      key={status}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span className="capitalize text-gray-600">
                                        {status.replace("_", " ")}
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {count}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          <Link
                            href="/appointments/calendar/advanced"
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            View Today&apos;s Schedule
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick actions */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Shortcut href="/patients" icon="👥" label="New Patient" />
                    <Shortcut
                      href="/appointments"
                      icon="📅"
                      label="New Appointment"
                    />
                    <Shortcut
                      href="/appointments/calendar/advanced"
                      icon="🗓️"
                      label="Open Calendar"
                    />
                    <Shortcut href="/settings" icon="⚙️" label="Settings" />
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡 <strong>Tip:</strong> Press "N" to create a new
                      appointment from anywhere in the app.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
