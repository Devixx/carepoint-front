// src/app/patients/page.tsx
"use client";

import Sidebar from "../ui/layout/Sidebar";
import Header from "../ui/layout/Header";
import Card from "../ui/primitives/Card";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPatient, deletePatient, listPatients } from "../api/patients";
import { Plus, Search, User } from "lucide-react";

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  const qc = useQueryClient();
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["patients", { page, limit, search: debounced }],
    queryFn: () => listPatients({ page, limit, search: debounced }),
    keepPreviousData: true,
  });

  const createMut = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      setOpenCreate(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });

  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64">
        <Header />

        <main className="p-8 space-y-8">
          {/* Title & actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Patients</h1>
              <p className="text-sm text-gray-500">
                Manage patient records and details
              </p>
            </div>
            <button
              onClick={() => setOpenCreate(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 text-white px-4 py-2 text-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> New Patient
            </button>
          </div>

          {/* Search */}
          <Card>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-96">
                <input
                  className="w-full rounded-lg border border-gray-200 pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                  placeholder="Search by name, email, phone…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Card>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {error && (
              <Card>
                <div className="text-red-600">Failed to load patients.</div>
              </Card>
            )}

            {(isLoading || isFetching) &&
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </Card>
              ))}

            {!isLoading && data?.items?.length
              ? data.items.map((p) => (
                  <Card key={p.id} hover>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {p.firstName} {p.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{p.email}</div>
                          {p.phone && (
                            <div className="text-sm text-gray-500">
                              {p.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMut.mutate(p.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </Card>
                ))
              : !isLoading && (
                  <div className="xl:col-span-3">
                    <Card>
                      <div className="text-center">
                        <User className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <div className="text-gray-600">No patients found.</div>
                      </div>
                    </Card>
                  </div>
                )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Total: {total} • Page {page} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Create patient modal (simple inline) */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenCreate(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-strong p-6">
            <h3 className="text-lg font-semibold mb-4">New Patient</h3>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const data = new FormData(form);
                createMut.mutate({
                  firstName: String(data.get("firstName") || ""),
                  lastName: String(data.get("lastName") || ""),
                  email: String(data.get("email") || ""),
                  phone: String(data.get("phone") || ""),
                });
              }}
            >
              <div>
                <label className="text-sm">First name</label>
                <input
                  name="firstName"
                  className="w-full mt-1 rounded border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm">Last name</label>
                <input
                  name="lastName"
                  className="w-full mt-1 rounded border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm">Email</label>
                <input
                  name="email"
                  type="email"
                  className="w-full mt-1 rounded border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm">Phone</label>
                <input
                  name="phone"
                  className="w-full mt-1 rounded border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
