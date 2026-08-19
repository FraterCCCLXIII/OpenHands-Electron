import type { ReactNode } from "react";
import { cn } from "#/utils/utils";

interface SegmentedToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedToggleProps<T extends string> {
  value: T | null;
  options: SegmentedToggleOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  testId?: string;
  size?: "sm" | "lg";
  className?: string;
  /** Stretch the control and give each option an equal share of the width. */
  equalWidth?: boolean;
}

/**
 * Lightweight 2-state segmented control used for the files-tab toggles
 * ("Rich"/"Plain") and a few other compact two-way choices.
 */
export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  testId,
  size = "sm",
  className,
  equalWidth = false,
}: SegmentedToggleProps<T>) {
  const isLarge = size === "lg";

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-testid={testId}
      className={cn(
        equalWidth ? "flex w-full" : "inline-flex",
        "items-center bg-[var(--oh-surface-raised)]",
        isLarge
          ? "rounded-full p-1 text-sm font-medium"
          : "rounded-md p-0.5 text-xs",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            data-testid={
              testId ? `${testId}-option-${option.value}` : undefined
            }
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center cursor-pointer transition-colors",
              isLarge
                ? "gap-2 px-5 py-2 rounded-full"
                : "gap-1.5 px-2.5 py-1 rounded",
              equalWidth && "flex-1 justify-center text-center",
              isActive
                ? "bg-[var(--oh-interactive-hover)] text-white"
                : "text-[var(--oh-muted)] hover:text-white",
            )}
          >
            {option.icon ? (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center justify-center",
                  isLarge
                    ? "size-4 [&_svg]:size-4"
                    : "size-3.5 [&_svg]:size-3.5",
                )}
              >
                {option.icon}
              </span>
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
