// src/app/calendar/MonthCalendar.tsx
"use client";

type EventItem = { id: string; title: string; start: Date; end: Date };

export default function MonthCalendar({
  monthStart, // first of month
  weeks, // 2D matrix of Dates (6 rows x 7 cols)
  eventsMap, // key: YYYY-MM-DD -> events[]
  onSelectDay,
}: {
  monthStart: Date;
  weeks: Date[][];
  eventsMap: Record<string, EventItem[]>;
  onSelectDay: (day: Date) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-soft">
      <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-500 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-2 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weeks.flat().map((day) => {
          const key = day.toISOString().slice(0, 10);
          const isOtherMonth = day.getMonth() !== monthStart.getMonth();
          const events = eventsMap[key] || [];
          return (
            <button
              key={key}
              onClick={() => onSelectDay(day)}
              className={`h-28 rounded-lg border p-2 text-left hover:shadow-sm transition
                ${
                  isOtherMonth
                    ? "bg-gray-50 border-gray-100 text-gray-400"
                    : "bg-white border-gray-200"
                }
              `}
            >
              <div className="text-xs font-medium">{day.getDate()}</div>
              <div className="mt-1 space-y-1">
                {events.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="truncate rounded bg-blue-50 text-blue-700 border border-blue-100 px-1 py-0.5 text-[11px]"
                  >
                    {e.title}
                  </div>
                ))}
                {events.length > 3 && (
                  <div className="text-[11px] text-gray-500">
                    +{events.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
