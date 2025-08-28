// src/app/ui/primitives/Card.tsx
"use client";
import clsx from "clsx";

export default function Card({
  children,
  className,
  padding = true,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={clsx(
        "bg-white border border-gray-100 rounded-xl shadow-soft",
        padding && "p-6",
        hover && "transition-all hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}
