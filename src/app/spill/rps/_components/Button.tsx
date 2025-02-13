"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "~/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary";
  size?: "default" | "lg";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" && "bg-purple-700 text-white hover:bg-purple-600",
        variant === "secondary" &&
          "bg-purple-600/50 text-white hover:bg-purple-500/50",
        size === "default" && "px-4 py-2",
        size === "lg" && "px-6 py-3",
        className,
      )}
      {...props}
    />
  );
}
