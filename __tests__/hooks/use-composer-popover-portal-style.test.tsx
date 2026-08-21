import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { ComposerDockedProvider } from "#/context/composer-docked-context";
import { useComposerPopoverPortalStyle } from "#/hooks/use-composer-popover-portal-style";

describe("useComposerPopoverPortalStyle", () => {
  let trigger: HTMLButtonElement;

  beforeEach(() => {
    trigger = document.createElement("button");
    trigger.getBoundingClientRect = () =>
      ({
        top: 500,
        left: 120,
        right: 180,
        bottom: 528,
        width: 60,
        height: 28,
        x: 120,
        y: 500,
        toJSON: () => ({}),
      }) as DOMRect;
    document.body.appendChild(trigger);
  });

  afterEach(() => {
    trigger.remove();
  });

  it("returns fixed coordinates above the trigger when the composer is docked", async () => {
    const triggerRef = { current: trigger };

    const { result } = renderHook(
      () => useComposerPopoverPortalStyle(triggerRef, true),
      {
        wrapper: ({ children }) => (
          <ComposerDockedProvider enabled>{children}</ComposerDockedProvider>
        ),
      },
    );

    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          position: "fixed",
          top: 492,
          left: 120,
          transform: "translateY(-100%)",
          zIndex: 9999,
        }),
      );
    });
  });

  it("does not portal when the composer is inline", () => {
    const triggerRef = { current: trigger };

    const { result } = renderHook(
      () => useComposerPopoverPortalStyle(triggerRef, true),
      {
        wrapper: ({ children }) => (
          <ComposerDockedProvider enabled={false}>
            {children}
          </ComposerDockedProvider>
        ),
      },
    );

    expect(result.current).toBeUndefined();
  });
});
