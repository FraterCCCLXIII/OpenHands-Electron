import { useState } from "react";
import { cn } from "#/utils/utils";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  className?: string;
  /** While the parent panel drag is active, keep the grip line highlighted. */
  isDragging?: boolean;
  testId?: string;
  /** Keep a 1px divider visible at rest (hover/drag still highlight it). */
  showLine?: boolean;
}

export function ResizeHandle({
  onMouseDown,
  className,
  isDragging = false,
  testId,
  showLine = false,
}: ResizeHandleProps) {
  const [isHovering, setIsHovering] = useState(false);
  const lineActive = isDragging || isHovering;
  let lineClassName = "bg-transparent";
  if (lineActive) {
    lineClassName = "bg-white";
  } else if (showLine) {
    lineClassName = "bg-[var(--oh-border)]";
  }

  return (
    <div
      data-testid={testId}
      className={cn("relative z-10 w-0 shrink-0 self-stretch", className)}
      aria-hidden
    >
      <div
        className="absolute inset-y-0 left-1/2 w-3 min-w-[12px] -translate-x-1/2 cursor-ew-resize"
        onMouseDown={onMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors",
          lineClassName,
        )}
        aria-hidden
      />
    </div>
  );
}
