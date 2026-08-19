import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AutomationInterviewEventTypeField } from "#/components/features/automations/automation-interview-event-type-field";
import { I18nKey } from "#/i18n/declaration";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AutomationInterviewEventTypeField", () => {
  it("adds an event type from the dropdown and hides it from the menu", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <AutomationInterviewEventTypeField
        selectedEvents={[]}
        onChange={onChange}
      />,
    );

    expect(
      screen.queryByTestId("automation-interview-draft-event-push"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByTestId("automation-interview-draft-event-add"));
    await user.click(
      screen.getByTestId("automation-interview-draft-event-option-push"),
    );

    expect(onChange).toHaveBeenCalledWith(["push"]);

    rerender(
      <AutomationInterviewEventTypeField
        selectedEvents={["push"]}
        onChange={onChange}
      />,
    );

    expect(
      screen.getByTestId("automation-interview-draft-event-push"),
    ).toHaveTextContent(I18nKey.AUTOMATIONS$INTERVIEW_EVENT_PUSH);

    await user.click(screen.getByTestId("automation-interview-draft-event-add"));
    expect(
      screen.queryByTestId("automation-interview-draft-event-option-push"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId(
        "automation-interview-draft-event-option-pull_request.opened",
      ),
    ).toBeInTheDocument();
  });

  it("removes a selected event type from the field", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AutomationInterviewEventTypeField
        selectedEvents={["push", "issues.opened"]}
        onChange={onChange}
      />,
    );

    await user.click(
      screen.getByTestId("automation-interview-draft-event-remove-push"),
    );

    expect(onChange).toHaveBeenCalledWith(["issues.opened"]);
  });
});
