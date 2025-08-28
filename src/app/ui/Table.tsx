// src/app/ui/Table.tsx
"use client";

export default function Table({
  columns,
  rows,
  loading,
  empty,
}: {
  columns: string[];
  rows: React.ReactNode[];
  loading?: boolean;
  empty?: string;
}) {
  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c} className="text-left p-2">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td className="p-3 text-gray-500" colSpan={columns.length}>
                Loading…
              </td>
            </tr>
          ) : rows.length ? (
            rows
          ) : (
            <tr>
              <td className="p-3 text-gray-500" colSpan={columns.length}>
                {empty ?? "No data"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
