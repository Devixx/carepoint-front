// Enhanced: src/app/ui/MetricCard.tsx - Professional Medical Interface
"use client";

import { ReactNode } from "react";
import Card from "./primitives/Card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon?: ReactNode;
  trendDirection?: "up" | "down" | "neutral";
  trendValue?: string;
  loading?: boolean;
  error?: boolean;
  className?: string;
}

export default function MetricCard({
  label,
  value,
  trend,
  icon,
  trendDirection,
  trendValue,
  loading = false,
  error = false,
  className = "",
}: MetricCardProps) {
  // Get trend styling
  const getTrendStyling = () => {
    switch (trendDirection) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "neutral":
      default:
        return "text-gray-500";
    }
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (trendDirection) {
      case "up":
        return <TrendingUp className="w-3 h-3" />;
      case "down":
        return <TrendingDown className="w-3 h-3" />;
      case "neutral":
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>

            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            ) : error ? (
              <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
            ) : (
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {typeof value === "number" ? value.toLocaleString() : value}
              </div>
            )}

            {/* Trend information */}
            <div className="flex items-center space-x-2 text-xs">
              {trendDirection && trendValue && (
                <div
                  className={`flex items-center space-x-1 ${getTrendStyling()}`}
                >
                  {getTrendIcon()}
                  <span className="font-medium">{trendValue}</span>
                </div>
              )}
              {trend && (
                <span className="text-gray-500">
                  {trendDirection && trendValue && "• "}
                  {trend}
                </span>
              )}
            </div>
          </div>

          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                {icon}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
