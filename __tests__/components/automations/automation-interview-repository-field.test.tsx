import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AutomationInterviewRepositoryField } from "#/components/features/automations/automation-interview-repository-field";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AutomationInterviewRepositoryField", () => {
  it("opens the add-repository modal from the plus control", async () => {
    const user = userEvent.setup();

    render(
      <AutomationInterviewRepositoryField repository="" onChange={vi.fn()} />,
    );

    const repositoryField = screen.getByTestId(
      "automation-interview-draft-repository",
    );
    expect(repositoryField).toContainElement(
      screen.getByTestId("automation-interview-draft-repository-add"),
    );

    expect(
      screen.queryByTestId("automation-interview-add-repository-modal"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByTestId("automation-interview-draft-repository-add"),
    );

    expect(
      screen.getByTestId("automation-interview-add-repository-modal"),
    ).toBeInTheDocument();
  });

  it("shows the repository as a removable pill after it is added", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AutomationInterviewRepositoryField repository="" onChange={onChange} />,
    );

    await user.click(
      screen.getByTestId("automation-interview-draft-repository-add"),
    );
    await user.type(
      screen.getByTestId("automation-interview-add-repository-address"),
      "openhands/openhands",
    );
    await user.click(
      screen.getByTestId("automation-interview-add-repository-submit"),
    );

    expect(onChange).toHaveBeenCalledWith("openhands/openhands");
  });

  it("renders a saved repository address in the field", () => {
    render(
      <AutomationInterviewRepositoryField
        repository="openhands/openhands"
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("automation-interview-draft-repository-value"),
    ).toHaveTextContent("openhands/openhands");
  });

  it("clears the repository when the pill remove button is clicked", () => {
    const onChange = vi.fn();

    render(
      <AutomationInterviewRepositoryField
        repository="openhands/openhands"
        onChange={onChange}
      />,
    );

    fireEvent.click(
      screen.getByTestId("automation-interview-draft-repository-remove"),
    );

    expect(onChange).toHaveBeenCalledWith("");
  });
});
