import { cn } from "@/lib/utils";
import SpotlightCard from "./SpotlightCard";

interface BentoCardProps {
  className?: string;
  children: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  noPadding?: boolean;
  translucent?: boolean;
}

export function BentoCard({
  className,
  children,
  colSpan = 1,
  rowSpan = 1,
  noPadding = false,
  translucent = false
}: BentoCardProps) {
  return (
    <SpotlightCard
      className={cn(
        "rounded-3xl transition-all duration-500 hover:scale-[1.01] relative overflow-hidden h-full",
        // Default styles unless translucent
        !translucent && "bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl",
        // Translucent style for glassmorphism
        translucent && "bg-white/5 backdrop-blur-md border border-white/10",
        // Padding control
        !noPadding && "p-6 md:p-8",
        // Layout
        colSpan > 1 && `col-span-${colSpan}`,
        rowSpan > 1 && `row-span-${rowSpan}`,
        className
      )}
      spotlightColor="rgba(255, 255, 255, 0.1)"
    >
      {children}
    </SpotlightCard>
  );
}
