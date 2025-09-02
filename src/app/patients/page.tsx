// Updated: src/app/patients/page.tsx - Using UI Primitives
"use client";

import Sidebar from "../ui/layout/Sidebar";
import Header from "../ui/layout/Header";
import Card from "../ui/primitives/Card";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPatient,
  deletePatient,
  listPatients,
  updatePatient,
  Patient,
} from "../api/patients";
import { Plus, Search, User, AlertCircle } from "lucide-react";

// Import updated components
import PatientEditModal, { PatientEditPayload } from "./PatientEditModal";
import CreatePatientModal, { CreatePatientPayload } from "./CreatePatientModal";
import ConfirmDialog from "../ui/primitives/ConfirmDialog";
import PatientCard from "./PatientCard";

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // Modal state
  const [openCreate, setOpenCreate] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);

  const qc = useQueryClient();

  // FIXED: Simple debouncing without infinite loops
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // FIXED: React Query with proper configuration
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["patients", { page, limit, search: debounced }],
    queryFn: () => listPatients({ page, limit, search: debounced }),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create patient mutation
  const createMut = useMutation({
    mutationFn: (payload: CreatePatientPayload) => createPatient(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      setOpenCreate(false);
    },
  });

  // Update patient mutation
  const updateMut = useMutation({
    mutationFn: ({ id, ...payload }: PatientEditPayload) =>
      updatePatient(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      setEditPatient(null);
    },
  });

  // Delete patient mutation
  const deleteMut = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      setDeletePatient(null);
    },
  });

  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Always visible */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                <p className="text-gray-600 mt-1">
                  Manage patient records and details
                </p>
              </div>
              <button
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </button>
            </div>

            {/* Search */}
            <div className="mt-6 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="ml-4 text-sm text-gray-500">
                Total: {total} • Page {page} / {totalPages}
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-6 p-6">
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Failed to load patients.</span>
              </div>
            </Card>
          )}

          {/* Patients Grid */}
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
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}

            {/* Patient Cards */}
            {!isLoading && data?.items?.length
              ? data.items.map((p) => (
                  <PatientCard
                    key={p.id}
                    patient={p}
                    onEdit={(patient) => setEditPatient(patient)}
                    onDelete={(patient) => setDeletePatient(patient)}
                  />
                ))
              : !isLoading && (
                  <div className="col-span-full">
                    <Card className="p-12 text-center">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No patients found.
                      </h3>
                      <button
                        onClick={() => setOpenCreate(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Patient
                      </button>
                    </Card>
                  </div>
                )}
          </div>

          {/* Pagination */}
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

          {/* Create Patient Modal */}
          <CreatePatientModal
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            onSubmit={(payload) => createMut.mutate(payload)}
            isLoading={createMut.isLoading}
          />

          {/* Edit Patient Modal */}
          <PatientEditModal
            open={editPatient !== null}
            patient={editPatient}
            onClose={() => setEditPatient(null)}
            onSubmit={(payload) => updateMut.mutate(payload)}
            isLoading={updateMut.isLoading}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={deletePatient !== null}
            title="Delete Patient"
            description={
              deletePatient
                ? `Are you sure you want to delete ${deletePatient.firstName} ${deletePatient.lastName}? This action cannot be undone and will remove all associated medical records.`
                : ""
            }
            confirmText="Delete Patient"
            cancelText="Cancel"
            onConfirm={() => {
              if (deletePatient) {
                deleteMut.mutate(deletePatient.id);
              }
            }}
            onCancel={() => setDeletePatient(null)}
            danger={true}
          />
        </main>
      </div>
    </div>
  );
}
