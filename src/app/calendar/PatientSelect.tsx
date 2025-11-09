// Fixed: src/app/calendar/PatientSelect.tsx - Now Properly Sets Patient ID
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { listPatients, Patient } from "../api/patients";
import { ChevronDown, Search, User, Check } from "lucide-react";

type Option = Patient;

export default function PatientSelect({
  value,
  onChange,
  placeholder = "Select patient...",
  error,
  disabled = false,
}: {
  value: Patient | undefined;
  onChange: (val: Patient) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetching, refetch, isLoading } =
    useInfiniteQuery({
      queryKey: ["patients-select", search],
      queryFn: ({ pageParam = 1 }) =>
        listPatients({ page: pageParam, limit: 25, search }),
      getNextPageParam: (lastPage) => {
        const { page, limit, total } = {
          page: lastPage.meta.page,
          limit: lastPage.meta.limit,
          total: lastPage.meta.total,
        };
        const totalPages = Math.ceil(total / limit);
        return page < totalPages ? page + 1 : undefined;
      },
      initialPageParam: 1,
    });

  useEffect(() => {
    const id = setTimeout(() => {
      refetch();
    }, 250);
    return () => clearTimeout(id);
  }, [search, refetch]);

  const withLabel = useCallback(
    (patient: Patient): Patient => ({
      ...patient,
      label:
        (patient.label ??
          [patient.firstName, patient.lastName].filter(Boolean).join(" ")) ||
        patient.email ||
        patient.id,
    }),
    []
  );

  const options: Patient[] = useMemo(() => {
    const items = data?.pages?.flatMap((p) => p.items) ?? [];
    return items.map(withLabel);
  }, [data, withLabel]);

  const normalizedValue = value ? withLabel(value) : undefined;

  // Find the selected option
  const selectedOption =
    options.find((o) => o.id === normalizedValue?.id) ?? normalizedValue;

  // ✅ Handle patient selection
  const handleSelect = (patient: Patient) => {
    console.log("Selected patient ID:", patient?.id); // Debug log
    onChange(withLabel(patient));
    setIsOpen(false);
    setSearch(""); // Reset search after selection
  };

  // ✅ Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  return (
    <div className="relative">
      {/* ✅ Main dropdown trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between ${
          error ? "border-red-300" : "border-gray-300"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-gray-400"
        }`}
      >
        <div className="flex items-center flex-1 min-w-0">
          <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <span
            className={`truncate ${
              selectedOption ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ✅ Dropdown menu */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-72 overflow-hidden">
            {/* Search input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search patients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {isFetching && (
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-500 mr-2"></div>
                  Searching...
                </div>
              )}
            </div>

            {/* Patient options */}
            <div className="max-h-64 min-h-[12rem] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  Loading patients...
                </div>
              ) : options.length ? (
                <>
                  {options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex items-center justify-between group"
                    >
                      <div className="flex items-center flex-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {option.id}
                          </div>
                        </div>
                      </div>
                      {value?.id === option.id && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </button>
                  ))}

                  {/* Load more button */}
                  {hasNextPage && (
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={isFetching}
                      className="w-full px-4 py-3 text-sm text-blue-600 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-t border-gray-200 disabled:opacity-50"
                    >
                      {isFetching ? "Loading..." : "Load more patients"}
                    </button>
                  )}
                </>
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">
                  {search
                    ? `No patients found for "${search}"`
                    : "No patients found"}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ✅ Selected patient display (for debugging) */}
      {value && selectedOption && (
        <div className="mt-1 text-xs text-gray-600">
          Selected: {selectedOption.label} (ID: {selectedOption.id})
        </div>
      )}
    </div>
  );
}
