// Updated: src/app/appointments/page.tsx - Cards Layout with Patient Info
"use client";

import Sidebar from "../ui/layout/Sidebar";
import Header from "../ui/layout/Header";
import Card from "../ui/primitives/Card";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  deleteAppointment,
  listAppointments,
  updateAppointment,
  Appointment,
} from "../api/appointments";
import { Plus, Search, Calendar, AlertCircle, Filter } from "lucide-react";

// Import new components
import AppointmentCard from "./AppointmentCard";
import AppointmentEditModal, {
  AppointmentEditPayload,
} from "./AppointmentEditModal";
import CreateAppointmentModal, {
  CreateAppointmentPayload,
} from "./CreateAppointmentModal";
import ConfirmDialog from "../ui/primitives/ConfirmDialog";

export default function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal state
  const [openCreate, setOpenCreate] = useState(false);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(
    null
  );
  const [deleteAppointment, setDeleteAppointment] =
    useState<Appointment | null>(null);
  const [viewAppointment, setViewAppointment] = useState<Appointment | null>(
    null
  );

  const qc = useQueryClient();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Appointments query
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["appointments", { page, limit, search: debounced }],
    queryFn: () => listAppointments({ page, limit }),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create appointment mutation
  const createMut = useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      createAppointment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      setOpenCreate(false);
    },
  });

  // Update appointment mutation
  const updateMut = useMutation({
    mutationFn: ({ id, ...payload }: AppointmentEditPayload) =>
      updateAppointment(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      setEditAppointment(null);
    },
  });

  // Delete appointment mutation
  const deleteMut = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      setDeleteAppointment(null);
    },
  });

  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Filter appointments by status
  const filteredAppointments =
    data?.items?.filter((appointment) => {
      const matchesSearch =
        search === "" ||
        appointment.title.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) ?? [];

  // Status counts for filter badges
  const statusCounts =
    data?.items?.reduce((acc, appointment) => {
      const status = appointment.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) ?? {};

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Appointments
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage appointments and patient schedules
                </p>
              </div>
              <button
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </button>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search appointments or patients..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Total: {total} • Page {page} / {totalPages}
                </div>
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    statusFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({total})
                </button>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap capitalize ${
                      statusFilter === status
                        ? "bg-blue-800 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status.replace("_", " ")} ({count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-6 p-6">
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Failed to load appointments.</span>
              </div>
            </Card>
          )}

          {/* Appointments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {/* Loading State */}
            {(isLoading || isFetching) &&
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}

            {/* Appointment Cards */}
            {!isLoading && filteredAppointments.length > 0
              ? filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={(appointment) => setEditAppointment(appointment)}
                    onDelete={(appointment) =>
                      setDeleteAppointment(appointment)
                    }
                    onViewDetails={(appointment) =>
                      setViewAppointment(appointment)
                    }
                  />
                ))
              : !isLoading && (
                  <div className="col-span-full">
                    <Card className="p-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {search || statusFilter !== "all"
                          ? "No appointments match your filters"
                          : "No appointments scheduled"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {search || statusFilter !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "Get started by scheduling your first appointment"}
                      </p>
                      {!search && statusFilter === "all" && (
                        <button
                          onClick={() => setOpenCreate(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Appointment
                        </button>
                      )}
                    </Card>
                  </div>
                )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Total: {total} • Page {page} / {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1 || isFetching}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages || isFetching}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Create Appointment Modal */}
          <CreateAppointmentModal
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            onSubmit={(payload) => createMut.mutate(payload)}
            isLoading={createMut.isLoading}
          />

          {/* Edit Appointment Modal */}
          <AppointmentEditModal
            open={editAppointment !== null}
            appointment={editAppointment}
            onClose={() => setEditAppointment(null)}
            onSubmit={(payload) => updateMut.mutate(payload)}
            isLoading={updateMut.isLoading}
          />

          {/* View Appointment Details (reuse edit modal for now) */}
          {viewAppointment && !editAppointment && (
            <AppointmentEditModal
              open={true}
              appointment={viewAppointment}
              onClose={() => setViewAppointment(null)}
              onSubmit={(payload) => {
                setViewAppointment(null);
                setEditAppointment(viewAppointment);
                updateMut.mutate(payload);
              }}
              isLoading={updateMut.isLoading}
            />
          )}

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={deleteAppointment !== null}
            title="Cancel Appointment"
            description={
              deleteAppointment
                ? `Are you sure you want to cancel the appointment "${deleteAppointment.title}" with patient ${deleteAppointment.patientId}? This action cannot be undone.`
                : ""
            }
            confirmText="Cancel Appointment"
            cancelText="Keep Appointment"
            onConfirm={() => {
              if (deleteAppointment) {
                deleteMut.mutate(deleteAppointment.id);
              }
            }}
            onCancel={() => setDeleteAppointment(null)}
            danger={true}
          />
        </main>
      </div>
    </div>
  );
}
