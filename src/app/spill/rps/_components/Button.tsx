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
        variant === "default" &&
          "bg-purple-700/90 text-white hover:bg-white/20",
        variant === "secondary" &&
          "bg-purple-600/90 text-white hover:bg-white/10",
        size === "default" && "px-4 py-2",
        size === "lg" && "px-6 py-3",
        className,
      )}
      {...props}
    />
  );
}
