import React from "react";
import ReactDOM from "react-dom";
import { useComposerDocked } from "#/context/composer-docked-context";
import { useComposerPopoverPortalStyle } from "#/hooks/use-composer-popover-portal-style";

interface ComposerPopoverPortalProps {
  triggerRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  align?: "left" | "right";
  minWidth?: number;
  maxWidth?: number;
  children: React.ReactNode;
}

/** Portals composer popovers above their trigger when the input is docked. */
export function ComposerPopoverPortal({
  triggerRef,
  open,
  align,
  minWidth,
  maxWidth,
  children,
}: ComposerPopoverPortalProps) {
  const isDocked = useComposerDocked();
  const portalStyle = useComposerPopoverPortalStyle(triggerRef, open, {
    align,
    minWidth,
    maxWidth,
  });

  if (!open) {
    return null;
  }

  if (isDocked) {
    if (!portalStyle || typeof document === "undefined") {
      return null;
    }
    return ReactDOM.createPortal(
      <div style={portalStyle}>{children}</div>,
      document.body,
    );
  }

  return <>{children}</>;
}

/** ContextMenu positioning resets when the menu is portaled above the composer. */
export const COMPOSER_PORTAL_MENU_CLASS_NAME =
  "!static !top-auto !bottom-auto !left-auto !right-auto !mb-0 !mt-0";
