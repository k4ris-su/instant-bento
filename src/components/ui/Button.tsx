"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition";
  const variants = {
    primary: "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90",
    secondary: "bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] hover:shadow-soft",
    ghost: "text-[var(--foreground)] hover:bg-[var(--background)] hover:shadow-soft",
  } as const;

  return <button className={cn(base, variants[variant], className)} {...props} />;
}