import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkflowColumnRecommendedAutomations } from "#/components/features/workflows/workflow-column-recommended-automations";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("WorkflowColumnRecommendedAutomations", () => {
  it("renders recommended rows with plus buttons", () => {
    const onAddRecommendation = vi.fn();

    render(
      <WorkflowColumnRecommendedAutomations
        stage="requirements"
        recommendations={[
          {
            id: "wf-rec-req-1",
            name: "Backlog groomer",
            description: "Close stale tickets.",
            stage: "requirements",
          },
        ]}
        onAddRecommendation={onAddRecommendation}
      />,
    );

    expect(
      screen.getByTestId("workflow-column-recommended-requirements"),
    ).toBeInTheDocument();
    expect(screen.getByText("Backlog groomer")).toBeInTheDocument();
    expect(
      screen.getByTestId("workflow-add-recommended-automation-wf-rec-req-1"),
    ).toBeInTheDocument();
  });

  it("adds a recommended automation when plus is clicked", () => {
    const onAddRecommendation = vi.fn();
    const recommendation = {
      id: "wf-rec-req-2",
      name: "Stakeholder digest",
      stage: "requirements" as const,
    };

    render(
      <WorkflowColumnRecommendedAutomations
        stage="requirements"
        recommendations={[recommendation]}
        onAddRecommendation={onAddRecommendation}
      />,
    );

    fireEvent.click(
      screen.getByTestId("workflow-add-recommended-automation-wf-rec-req-2"),
    );

    expect(onAddRecommendation).toHaveBeenCalledWith(recommendation);
  });
});
