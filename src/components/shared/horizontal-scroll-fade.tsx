import React from "react";
import { cn } from "#/utils/utils";

const SCROLL_EDGE_THRESHOLD_PX = 1;
const FADE_WIDTH_CLASS = "w-10";

export interface ScrollFadeState {
  left: boolean;
  right: boolean;
}

export function readScrollFadeState(element: HTMLDivElement): ScrollFadeState {
  const { scrollLeft, scrollWidth, clientWidth } = element;
  const maxScroll = scrollWidth - clientWidth;
  const hasOverflow = maxScroll > SCROLL_EDGE_THRESHOLD_PX;

  return {
    left: hasOverflow && scrollLeft > SCROLL_EDGE_THRESHOLD_PX,
    right: hasOverflow && scrollLeft < maxScroll - SCROLL_EDGE_THRESHOLD_PX,
  };
}

interface HorizontalScrollFadeProps {
  children: React.ReactNode;
  className?: string;
  scrollClassName?: string;
  scrollTestId?: string;
  fadeTestIdPrefix?: string;
}

export function HorizontalScrollFade({
  children,
  className,
  scrollClassName,
  scrollTestId,
  fadeTestIdPrefix = "horizontal-scroll-fade",
}: HorizontalScrollFadeProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [fadeState, setFadeState] = React.useState<ScrollFadeState>({
    left: false,
    right: false,
  });

  const updateFadeState = React.useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }
    setFadeState(readScrollFadeState(element));
  }, []);

  React.useLayoutEffect(() => {
    updateFadeState();

    const element = scrollRef.current;
    if (!element) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(updateFadeState);
    resizeObserver.observe(element);

    const content = element.firstElementChild;
    if (content) {
      resizeObserver.observe(content);
    }

    return () => resizeObserver.disconnect();
  }, [updateFadeState, children]);

  return (
    <div className={cn("relative max-w-full min-w-0", className)}>
      <div
        ref={scrollRef}
        data-testid={scrollTestId}
        onScroll={updateFadeState}
        className={cn(
          "max-w-full overflow-x-auto scrollbar-hide",
          scrollClassName,
        )}
      >
        {children}
      </div>
      <div
        aria-hidden
        data-testid={`${fadeTestIdPrefix}-left`}
        data-visible={fadeState.left ? "true" : "false"}
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10",
          FADE_WIDTH_CLASS,
          "bg-gradient-to-r from-[var(--oh-scroll-fade-from,var(--oh-color-base))] to-transparent",
          "transition-opacity duration-300 ease-out motion-reduce:transition-none",
          fadeState.left ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden
        data-testid={`${fadeTestIdPrefix}-right`}
        data-visible={fadeState.right ? "true" : "false"}
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10",
          FADE_WIDTH_CLASS,
          "bg-gradient-to-l from-[var(--oh-scroll-fade-from,var(--oh-color-base))] to-transparent",
          "transition-opacity duration-300 ease-out motion-reduce:transition-none",
          fadeState.right ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
