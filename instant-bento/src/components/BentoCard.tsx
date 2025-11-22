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
        "rounded-2xl bg-white p-6 shadow-sm border border-gray-100",
        "dark:bg-gray-900 dark:border-gray-800",
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