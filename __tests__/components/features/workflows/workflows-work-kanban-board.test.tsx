import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkflowsWorkKanbanBoard } from "#/components/features/workflows/workflows-work-kanban-board";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("WorkflowsWorkKanbanBoard", () => {
  it("renders SDLC columns with work items from active sources", () => {
    render(<WorkflowsWorkKanbanBoard />);

    expect(screen.getByTestId("workflows-work-kanban-board")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-card-wf-1")).toBeInTheDocument();
    expect(screen.queryByTestId("workflow-card-wf-2")).not.toBeInTheDocument();
  });

  it("shows linked automation names on work cards", () => {
    render(<WorkflowsWorkKanbanBoard />);

    expect(
      screen.getByTestId("workflow-card-automation-footer-wf-1"),
    ).toHaveTextContent("Triage incoming issues");
  });

  it("moves a work item to another column on drop", () => {
    render(<WorkflowsWorkKanbanBoard />);

    const card = screen.getByTestId("workflow-card-wf-1");
    const designColumn = screen.getByTestId("workflow-work-column-design");

    fireEvent.dragStart(card);
    fireEvent.dragOver(designColumn);
    fireEvent.drop(designColumn);

    expect(
      designColumn.querySelector('[data-testid="workflow-card-wf-1"]'),
    ).toBeInTheDocument();
  });
});
