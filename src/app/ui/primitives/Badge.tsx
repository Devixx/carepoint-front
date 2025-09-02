// src/app/ui/primitives/Badge.tsx
"use client";
import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "gray";
  size?: "sm" | "md";
};

export default function Badge({
  children,
  variant = "gray",
  size = "md",
}: BadgeProps) {
  const variants = {
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-success-50 text-success-700 border-success-200",
    warning: "bg-warning-50 text-warning-700 border-warning-200",
    danger: "bg-danger-50 text-danger-700 border-danger-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium border rounded-full",
        variants[variant],
        sizes[size]
      )}
    >
      {children}
    </span>
  );
}
