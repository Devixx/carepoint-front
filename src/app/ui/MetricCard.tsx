// src/app/ui/MetricCard.tsx
"use client";

import { ReactNode } from "react";
import Card from "./primitives/Card";

export default function MetricCard({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon?: ReactNode;
}) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
          {trend && <div className="mt-1 text-xs text-green-600">{trend}</div>}
        </div>
        {icon && <div className="text-blue-600">{icon}</div>}
      </div>
    </Card>
  );
}
