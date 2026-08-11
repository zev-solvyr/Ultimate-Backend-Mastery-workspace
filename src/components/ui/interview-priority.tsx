import { cn } from "@/lib/utils";
import { getPriorityLabel } from "@/lib/utils";
import type { InterviewPriority } from "@/types";

interface InterviewPriorityProps {
  priority: InterviewPriority;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function InterviewPriorityStars({
  priority,
  showLabel = false,
  size = "md",
  className,
}: InterviewPriorityProps) {
  const starSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("tracking-tight", starSize)} aria-label={`Priority ${priority} of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={i < priority ? "text-gold" : "text-muted-foreground/30"}
          >
            ★
          </span>
        ))}
      </span>
      {showLabel && (
        <span className="text-[10px] text-muted-foreground">{getPriorityLabel(priority)}</span>
      )}
    </div>
  );
}
