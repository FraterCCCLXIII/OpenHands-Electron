import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AutomationInterviewAddRepositoryModal } from "#/components/features/automations/automation-interview-add-repository-modal";
import { I18nKey } from "#/i18n/declaration";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AutomationInterviewAddRepositoryModal", () => {
  it("submits a trimmed repository address", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onClose = vi.fn();

    render(
      <AutomationInterviewAddRepositoryModal
        isOpen
        onClose={onClose}
        onAdd={onAdd}
      />,
    );

    await user.type(
      screen.getByTestId("automation-interview-add-repository-address"),
      "  github:openhands/openhands  ",
    );
    await user.click(
      screen.getByTestId("automation-interview-add-repository-submit"),
    );

    expect(onAdd).toHaveBeenCalledWith("github:openhands/openhands");
    expect(onClose).toHaveBeenCalled();
  });

  it("does not submit when the address is empty", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(
      <AutomationInterviewAddRepositoryModal
        isOpen
        onClose={vi.fn()}
        onAdd={onAdd}
      />,
    );

    expect(
      screen.getByTestId("automation-interview-add-repository-submit"),
    ).toBeDisabled();

    await user.click(
      screen.getByTestId("automation-interview-add-repository-submit"),
    );

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("renders the modal title and address label from i18n", () => {
    render(
      <AutomationInterviewAddRepositoryModal
        isOpen
        onClose={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(
      screen.getByText(I18nKey.AUTOMATIONS$INTERVIEW_REPO_ADD_MODAL_TITLE),
    ).toBeInTheDocument();
    expect(
      screen.getByText(I18nKey.AUTOMATIONS$INTERVIEW_REPO_ADDRESS_LABEL),
    ).toBeInTheDocument();
  });
});
