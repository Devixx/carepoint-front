// src/app/calendar/PatientSelect.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { listPatients } from "../api/patients";

type Option = { id: string; label: string };

export default function PatientSelect({
  value,
  onChange,
  placeholder = "Select patient...",
}: {
  value: string | undefined;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
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

  const options: Option[] = useMemo(() => {
    const items = data?.pages?.flatMap((p) => p.items) ?? [];
    return items.map((p) => ({
      id: p.id,
      label:
        [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email || p.id,
    }));
  }, [data]);

  return (
    <div>
      <div className="relative mb-2">
        <input
          className="w-full rounded border border-gray-200 pl-3 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
          placeholder="Search patients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isFetching && (
          <div className="absolute right-2 top-2.5 text-xs text-gray-400">
            …
          </div>
        )}
      </div>

      <div className="h-44 overflow-auto rounded border border-gray-200">
        {isLoading ? (
          <div className="p-3 text-sm text-gray-500">Loading...</div>
        ) : options.length ? (
          <>
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange(opt.id)}
                className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                  value === opt.id
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
            {hasNextPage && (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border-t border-gray-100"
              >
                Load more…
              </button>
            )}
          </>
        ) : (
          <div className="p-3 text-sm text-gray-500">No patients found.</div>
        )}
      </div>

      {value && (
        <div className="mt-2 text-xs text-gray-600">
          Selected: {options.find((o) => o.id === value)?.label || value}
        </div>
      )}
    </div>
  );
}
