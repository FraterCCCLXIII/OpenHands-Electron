import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkflowWorkCard } from "#/components/features/workflows/workflow-work-card";
import type { WorkflowItem } from "#/types/workflow";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));

const sampleItem: WorkflowItem = {
  id: "wf-1",
  title: "OAuth device flow",
  description: "Security constraints and acceptance criteria.",
  stage: "requirements",
  source: "github",
  assignee: "Alex",
  automationId: "wf-auto-req-1",
};

describe("WorkflowWorkCard", () => {
  it("renders title, source, assignee, and automation footer", () => {
    render(
      <WorkflowWorkCard
        item={sampleItem}
        automationName="Triage incoming issues"
        isDragging={false}
        onDragStart={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );

    expect(screen.getByTestId("workflow-card-wf-1")).toBeInTheDocument();
    expect(screen.getByText("OAuth device flow")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-card-source-wf-1")).toBeInTheDocument();
    expect(
      screen.getByTestId("workflow-card-automation-footer-wf-1"),
    ).toHaveTextContent("Triage incoming issues");
  });
});
