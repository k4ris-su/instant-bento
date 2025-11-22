import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-soft", className)}>
      {children}
    </div>
  );
}