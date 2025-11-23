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
    <div className={cn("relative group h-full", colSpan > 1 && `col-span-${colSpan}`, rowSpan > 1 && `row-span-${rowSpan}`)}>
      {/* Pixel Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#32f08c]/30 group-hover:border-[#32f08c] transition-colors z-20 -translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#32f08c]/30 group-hover:border-[#32f08c] transition-colors z-20 translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#32f08c]/30 group-hover:border-[#32f08c] transition-colors z-20 -translate-x-[1px] translate-y-[1px]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#32f08c]/30 group-hover:border-[#32f08c] transition-colors z-20 translate-x-[1px] translate-y-[1px]" />

      <SpotlightCard
        className={cn(
          "rounded-none transition-all duration-500 hover:scale-[1.01] relative overflow-hidden h-full",
          // Default styles unless translucent
          !translucent && "bg-black/40 border border-white/10 shadow-sm hover:shadow-xl",
          // Translucent style for glassmorphism
          translucent && "bg-black/20 backdrop-blur-md border border-white/10",
          // Padding control
          !noPadding && "p-6 md:p-8",
          className
        )}
        spotlightColor="rgba(50, 240, 140, 0.15)"
      >
        {children}
      </SpotlightCard>
    </div>
  );
}
