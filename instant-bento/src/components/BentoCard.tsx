import { cn } from "@/lib/utils";

interface BentoCardProps {
  className?: string;
  children: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
}

export function BentoCard({ 
  className, 
  children, 
  colSpan = 1, 
  rowSpan = 1 
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[var(--card)] p-6 shadow-soft border border-[var(--border)]",
        "transition-all duration-300 hover:shadow-md",
        colSpan > 1 && `col-span-${colSpan}`,
        rowSpan > 1 && `row-span-${rowSpan}`,
        className
      )}
    >
      {children}
    </div>
  );
}