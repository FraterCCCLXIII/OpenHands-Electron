import type { ReactNode } from "react";
import { ResizeHandle } from "#/components/ui/resize-handle";
import { useBreakpoint } from "#/hooks/use-breakpoint";
import { useResizablePanels } from "#/hooks/use-resizable-panels";
import { cn } from "#/utils/utils";

const AUTOMATIONS_CREATE_DRAWER_WIDTH_KEY = "automations-create-drawer-width";

interface AutomationCreateSplitLayoutProps {
  children: ReactNode;
  drawer: ReactNode | null;
}

/**
 * Pushes dashboard content left when the create-automation conversation
 * pane is open. Does not overlay. Narrow viewports show only the drawer.
 */
export function AutomationCreateSplitLayout({
  children,
  drawer,
}: AutomationCreateSplitLayoutProps) {
  const isMobile = useBreakpoint();
  const { leftWidth, rightWidth, isDragging, containerRef, handleMouseDown } =
    useResizablePanels({
      defaultLeftWidth: 60,
      minLeftWidth: 40,
      maxLeftWidth: 75,
      storageKey: AUTOMATIONS_CREATE_DRAWER_WIDTH_KEY,
    });
  const isOpen = drawer != null;

  if (!isOpen) {
    return <div className="h-full min-h-0">{children}</div>;
  }

  if (isMobile) {
    return <div className="flex h-full min-h-0 flex-col">{drawer}</div>;
  }

  return (
    <div
      ref={containerRef}
      data-testid="automation-create-split"
      className="flex h-full min-h-0 overflow-hidden"
    >
      <div
        className="min-h-0 min-w-0 overflow-hidden"
        style={{
          width: `${leftWidth}%`,
          transitionProperty: isDragging ? "none" : "width",
        }}
      >
        <div className="h-full overflow-auto custom-scrollbar">{children}</div>
      </div>
      <ResizeHandle onMouseDown={handleMouseDown} isDragging={isDragging} />
      <div
        className={cn("min-h-0 min-w-0 overflow-hidden")}
        style={{
          width: `${rightWidth}%`,
          transitionProperty: isDragging ? "none" : "width",
        }}
      >
        {drawer}
      </div>
    </div>
  );
}
