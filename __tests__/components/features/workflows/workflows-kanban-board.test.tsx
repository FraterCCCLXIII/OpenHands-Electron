import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkflowsKanbanBoard } from "#/components/features/workflows/workflows-kanban-board";
import { I18nKey } from "#/i18n/declaration";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("WorkflowsKanbanBoard", () => {
  it("renders SDLC columns filled with automations", () => {
    render(<WorkflowsKanbanBoard />);

    expect(screen.getByTestId("workflows-kanban-board")).toBeInTheDocument();
    expect(
      screen.getByTestId("workflow-column-sources-requirements"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("workflow-automation-card-wf-auto-req-1"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("workflow-automation-card-wf-auto-req-2"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("workflow-automation-card-wf-auto-des-1"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("workflow-card-wf-1")).not.toBeInTheDocument();
  });

  it("shows per-column automation counts in the header badge", () => {
    render(<WorkflowsKanbanBoard />);

    expect(screen.getByTestId("workflow-column-count-requirements")).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId("workflow-column-count-design")).toHaveTextContent(
      "1",
    );
  });

  it("shows recommended automations below the active cards", () => {
    render(<WorkflowsKanbanBoard />);

    expect(
      screen.getByTestId("workflow-column-recommended-requirements"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("workflow-recommended-automation-wf-rec-req-1"),
    ).toBeInTheDocument();
  });

  it("adds a recommended automation to the column when plus is clicked", () => {
    render(<WorkflowsKanbanBoard />);

    fireEvent.click(
      screen.getByTestId("workflow-add-recommended-automation-wf-rec-req-1"),
    );

    expect(
      screen.getByTestId("workflow-automation-card-wf-rec-req-1"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("workflow-recommended-automation-wf-rec-req-1"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("workflow-column-count-requirements")).toHaveTextContent(
      "3",
    );
  });

  it("moves an automation to another column on drop", () => {
    render(<WorkflowsKanbanBoard />);

    const automation = screen.getByTestId("workflow-automation-card-wf-auto-req-1");
    const designColumn = screen.getByTestId("workflow-column-design");

    fireEvent.dragStart(automation);
    fireEvent.dragOver(designColumn);
    fireEvent.drop(designColumn);

    expect(
      withinColumn(designColumn).getByTestId(
        "workflow-automation-card-wf-auto-req-1",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("workflow-column-requirements")?.contains(
        screen.queryByTestId("workflow-automation-card-wf-auto-req-1") ?? null,
      ),
    ).toBe(false);
  });
});

function withinColumn(column: HTMLElement) {
  return {
    getByTestId: (testId: string) => {
      const node = column.querySelector(`[data-testid="${testId}"]`);
      if (!node) {
        throw new Error(`Missing ${testId} in column`);
      }
      return node as HTMLElement;
    },
  };
}

describe("WorkflowsKanbanBoard i18n keys", () => {
  it("declares column label keys", () => {
    expect(I18nKey.WORKFLOWS$COLUMN_REQUIREMENTS).toBeDefined();
    expect(I18nKey.WORKFLOWS$COLUMN_RELEASE).toBeDefined();
    expect(I18nKey.WORKFLOWS$COLUMN_NO_AUTOMATIONS).toBeDefined();
  });
});
