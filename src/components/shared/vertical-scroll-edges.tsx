import React from "react";
import { cn } from "#/utils/utils";

const SCROLL_EDGE_THRESHOLD_PX = 1;

export interface VerticalScrollEdgeState {
  top: boolean;
  bottom: boolean;
}

export function readVerticalScrollEdgeState(
  element: HTMLDivElement,
): VerticalScrollEdgeState {
  const { scrollTop, scrollHeight, clientHeight } = element;
  const hasOverflow = scrollHeight - clientHeight > SCROLL_EDGE_THRESHOLD_PX;

  return {
    top: hasOverflow && scrollTop > SCROLL_EDGE_THRESHOLD_PX,
    bottom: hasOverflow,
  };
}

interface VerticalScrollEdgesProps {
  children: React.ReactNode;
  className?: string;
  scrollClassName?: string;
  scrollTestId?: string;
  edgeTestIdPrefix?: string;
}

export function VerticalScrollEdges({
  children,
  className,
  scrollClassName,
  scrollTestId,
  edgeTestIdPrefix = "vertical-scroll-edges",
}: VerticalScrollEdgesProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [edgeState, setEdgeState] = React.useState<VerticalScrollEdgeState>({
    top: false,
    bottom: false,
  });

  const updateEdgeState = React.useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }
    setEdgeState(readVerticalScrollEdgeState(element));
  }, []);

  React.useLayoutEffect(() => {
    updateEdgeState();

    const element = scrollRef.current;
    if (!element) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(updateEdgeState);
    resizeObserver.observe(element);

    const content = element.firstElementChild;
    if (content) {
      resizeObserver.observe(content);
    }

    return () => resizeObserver.disconnect();
  }, [updateEdgeState, children]);

  return (
    <div
      className={cn(
        "relative flex min-h-0 min-w-0 flex-col overflow-hidden",
        className,
      )}
    >
      <div
        ref={scrollRef}
        data-testid={scrollTestId}
        onScroll={updateEdgeState}
        className={cn("min-h-0 flex-1 overflow-y-auto", scrollClassName)}
      >
        {children}
      </div>
      <div
        aria-hidden
        data-testid={`${edgeTestIdPrefix}-top`}
        data-visible={edgeState.top ? "true" : "false"}
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10 border-t border-[var(--oh-border)]",
          "transition-opacity duration-200 ease-out motion-reduce:transition-none",
          edgeState.top ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden
        data-testid={`${edgeTestIdPrefix}-bottom`}
        data-visible={edgeState.bottom ? "true" : "false"}
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 border-b border-[var(--oh-border)]",
          "transition-opacity duration-200 ease-out motion-reduce:transition-none",
          edgeState.bottom ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
