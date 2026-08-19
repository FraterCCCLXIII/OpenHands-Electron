import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkflowAutomationCard } from "#/components/features/workflows/workflow-automation-card";

describe("WorkflowAutomationCard", () => {
  it("renders the automation name and description", () => {
    render(
      <WorkflowAutomationCard
        automation={{
          id: "wf-auto-req-1",
          name: "Triage incoming issues",
          description: "Label and assign new tickets.",
          stage: "requirements",
        }}
        isDragging={false}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("workflow-automation-card-wf-auto-req-1"),
    ).toBeInTheDocument();
    expect(screen.getByText("Triage incoming issues")).toBeInTheDocument();
    expect(screen.getByText("Label and assign new tickets.")).toBeInTheDocument();
  });
});
