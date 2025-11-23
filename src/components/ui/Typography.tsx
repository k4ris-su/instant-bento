import { cn } from "@/lib/utils";

export function H1({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={cn("text-4xl font-semibold tracking-tight text-[var(--foreground)]", className)}>{children}</h1>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-[var(--foreground)]">{children}</h3>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-[var(--muted)]">{children}</p>;
}
