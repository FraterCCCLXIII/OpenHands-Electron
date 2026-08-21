import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { AutomationInterviewPromptBottomGrip } from "#/components/features/automations/automation-interview-prompt-bottom-grip";
import { usePromptTextareaResize } from "#/hooks/use-prompt-textarea-resize";

describe("usePromptTextareaResize", () => {
  it("grows the textarea when dragging the bottom grip downward", () => {
    const textareaRef = createRef<HTMLTextAreaElement>();
    render(
      <textarea ref={textareaRef} data-testid="prompt-textarea" defaultValue="" />,
    );

    const { result } = renderHook(() => usePromptTextareaResize(textareaRef));

    const textarea = screen.getByTestId("prompt-textarea");
    expect(textarea.style.height).toBe("120px");

    result.current.handleGripMouseDown({
      preventDefault: vi.fn(),
      clientY: 100,
    } as unknown as React.MouseEvent);

    document.dispatchEvent(
      new MouseEvent("mousemove", { clientY: 160, bubbles: true }),
    );
    document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    expect(Number.parseInt(textarea.style.height, 10)).toBe(180);
  });
});

describe("AutomationInterviewPromptBottomGrip", () => {
  it("renders the hover resize line inside the prompt container", () => {
    const gripRef = createRef<HTMLDivElement>();

    render(
      <AutomationInterviewPromptBottomGrip
        gripRef={gripRef}
        isGripDragging={false}
        onMouseDown={vi.fn()}
        onTouchStart={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("automation-interview-draft-prompt-grip"),
    ).toBeInTheDocument();
    expect(gripRef.current).toHaveClass("bg-white");
  });
});
