import React from "react";
import { useComposerDocked } from "#/context/composer-docked-context";

const GAP_PX = 8;
const VIEWPORT_GUTTER_PX = 8;

export function useComposerPopoverPortalStyle(
  triggerRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  options?: {
    align?: "left" | "right";
    minWidth?: number;
    maxWidth?: number;
  },
): React.CSSProperties | undefined {
  const isDocked = useComposerDocked();
  const { align = "left", minWidth, maxWidth = 16 * 16 } = options ?? {};
  const [style, setStyle] = React.useState<React.CSSProperties>();

  React.useLayoutEffect(() => {
    if (!open || !isDocked || !triggerRef.current) {
      setStyle(undefined);
      return undefined;
    }

    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const width = Math.min(
        Math.max(minWidth ?? rect.width, rect.width),
        maxWidth,
        window.innerWidth - VIEWPORT_GUTTER_PX * 2,
      );
      let left = align === "right" ? rect.right - width : rect.left;
      if (left < VIEWPORT_GUTTER_PX) left = VIEWPORT_GUTTER_PX;
      if (left + width > window.innerWidth - VIEWPORT_GUTTER_PX) {
        left = Math.max(
          VIEWPORT_GUTTER_PX,
          window.innerWidth - VIEWPORT_GUTTER_PX - width,
        );
      }

      setStyle({
        position: "fixed",
        top: rect.top - GAP_PX,
        left,
        width,
        transform: "translateY(-100%)",
        zIndex: 9999,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, isDocked, triggerRef, align, minWidth, maxWidth]);

  return isDocked && open ? style : undefined;
}
