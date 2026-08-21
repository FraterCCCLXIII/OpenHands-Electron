import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AutomationInterviewOptionalFields } from "#/components/features/automations/automation-interview-optional-fields";
import { I18nKey } from "#/i18n/declaration";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AutomationInterviewOptionalFields", () => {
  it("shows the add timeout chip until the field is revealed", async () => {
    const user = userEvent.setup();

    render(
      <AutomationInterviewOptionalFields timeout="" onPatch={vi.fn()} />,
    );

    expect(
      screen.getByTestId("automation-interview-draft-additional-options-label"),
    ).toHaveTextContent(I18nKey.AUTOMATIONS$ADDITIONAL_OPTIONS);
    expect(
      screen.getByTestId("automation-interview-draft-timeout-add"),
    ).toHaveTextContent(`${I18nKey.BUTTON$ADD} ${I18nKey.AUTOMATIONS$TIMEOUT_SHORT}`);
    expect(
      screen.queryByTestId("automation-interview-draft-timeout"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByTestId("automation-interview-draft-timeout-add"),
    );

    expect(
      screen.getByTestId("automation-interview-draft-timeout"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-timeout-add"),
    ).not.toBeInTheDocument();
  });

  it("opens with the timeout field when a value already exists", () => {
    render(
      <AutomationInterviewOptionalFields timeout="900" onPatch={vi.fn()} />,
    );

    expect(
      screen.getByTestId("automation-interview-draft-timeout"),
    ).toHaveValue(900);
    expect(
      screen.queryByTestId("automation-interview-draft-timeout-add"),
    ).not.toBeInTheDocument();
  });

  it("clears the timeout and hides the field when remove is clicked", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn();

    render(
      <AutomationInterviewOptionalFields timeout="900" onPatch={onPatch} />,
    );

    await user.click(
      screen.getByTestId("automation-interview-draft-timeout-remove"),
    );

    expect(onPatch).toHaveBeenCalledWith({ timeout: "" });
  });
});
