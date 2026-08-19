import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkflowColumnAutomations } from "#/components/features/workflows/workflow-column-automations";

vi.mock("#/components/features/automations/add-automation-modal", () => ({
  AddAutomationModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="add-automation-modal" /> : null,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("WorkflowColumnAutomations", () => {
  it("renders the add automation control for the column", () => {
    render(<WorkflowColumnAutomations stage="requirements" />);

    expect(screen.getByTestId("workflow-add-automation-requirements")).toBeInTheDocument();
  });

  it("opens the add automation modal for the column", () => {
    render(<WorkflowColumnAutomations stage="design" />);

    fireEvent.click(screen.getByTestId("workflow-add-automation-design"));

    expect(screen.getByTestId("add-automation-modal")).toBeInTheDocument();
  });
});
