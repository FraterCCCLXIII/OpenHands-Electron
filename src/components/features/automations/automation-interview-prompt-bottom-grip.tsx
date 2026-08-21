import type { RefObject, MouseEvent, TouchEvent } from "react";
import { cn } from "#/utils/utils";

interface AutomationInterviewPromptBottomGripProps {
  gripRef: RefObject<HTMLDivElement | null>;
  isGripDragging: boolean;
  onMouseDown: (event: MouseEvent) => void;
  onTouchStart: (event: TouchEvent) => void;
}

export function AutomationInterviewPromptBottomGrip({
  gripRef,
  isGripDragging,
  onMouseDown,
  onTouchStart,
}: AutomationInterviewPromptBottomGripProps) {
  return (
    <div
      data-testid="automation-interview-draft-prompt-grip"
      className="group absolute bottom-0 left-0 z-20 h-3 w-full"
    >
      <div
        className="absolute inset-0 z-[1] cursor-ns-resize select-none"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        aria-hidden
      />
      <div
        ref={gripRef}
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 z-[2] h-px w-full bg-white transition-opacity duration-200",
          isGripDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      />
    </div>
  );
}
