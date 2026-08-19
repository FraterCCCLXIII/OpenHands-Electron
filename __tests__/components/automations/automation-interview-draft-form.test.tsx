import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AutomationInterviewDraftForm } from "#/components/features/automations/automation-interview-draft-form";
import { I18nKey } from "#/i18n/declaration";
import { createEmptyAutomationDraft } from "#/utils/automation-create-interview";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("#/hooks/query/use-llm-profiles", () => ({
  useLlmProfiles: () => ({
    data: { profiles: [{ name: "glm-5.2" }] },
    isLoading: false,
  }),
}));

describe("AutomationInterviewDraftForm", () => {
  it("edits the name and prompt on the draft", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn();
    const draft = createEmptyAutomationDraft("conv-1");

    render(<AutomationInterviewDraftForm draft={draft} onPatch={onPatch} />);

    await user.type(
      screen.getByTestId("automation-interview-draft-name"),
      "Standup digest",
    );
    expect(onPatch).toHaveBeenCalledWith(
      expect.objectContaining({ name: expect.stringContaining("S") }),
    );

    await user.type(
      screen.getByTestId("automation-interview-draft-prompt"),
      "Post a digest",
    );
    expect(onPatch).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: expect.stringContaining("P") }),
    );
  });

  it("shows schedule fields after choosing a schedule trigger", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn();
    const draft = {
      ...createEmptyAutomationDraft("conv-1"),
      triggerType: "schedule" as const,
    };

    render(<AutomationInterviewDraftForm draft={draft} onPatch={onPatch} />);

    expect(
      screen.getByTestId("automation-interview-draft-schedule"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-cron"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-timezone"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-integration"),
    ).not.toBeInTheDocument();

    await user.type(
      screen.getByTestId("automation-interview-draft-cron"),
      "0 6 * * *",
    );
    expect(onPatch).toHaveBeenCalledWith({
      schedulePreset: "custom",
      cronExpression: expect.stringContaining("0"),
    });

    await user.click(
      screen.getByTestId("automation-interview-draft-trigger-option-event"),
    );

    expect(onPatch).toHaveBeenCalledWith({ triggerType: "event" });
  });

  it("shows event fields and lets the user add and remove event types", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn();
    const draft = {
      ...createEmptyAutomationDraft("conv-1"),
      triggerType: "event" as const,
      selectedEvents: ["push"],
    };

    render(<AutomationInterviewDraftForm draft={draft} onPatch={onPatch} />);

    expect(
      screen.getByTestId("automation-interview-draft-integration"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-repository"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-schedule"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByTestId("automation-interview-draft-event-remove-push"),
    );
    expect(onPatch).toHaveBeenCalledWith({ selectedEvents: [] });

    await user.click(screen.getByTestId("automation-interview-draft-event-add"));
    await user.click(
      screen.getByTestId(
        "automation-interview-draft-event-option-issues.opened",
      ),
    );
    expect(onPatch).toHaveBeenCalledWith({
      selectedEvents: ["push", "issues.opened"],
    });

    const helpButton = screen.getByTestId(
      "automation-interview-draft-event-filter-help",
    );
    expect(helpButton).toBeInTheDocument();
    expect(
      screen.queryByTestId(
        "automation-interview-draft-event-filter-help-popover",
      ),
    ).not.toBeInTheDocument();

    await user.click(helpButton);
    expect(
      screen.getByTestId("automation-interview-draft-event-filter-help-popover"),
    ).toHaveTextContent(I18nKey.AUTOMATIONS$DETAIL$EVENT_FILTER_HELP);
  });

  it("keeps model, timeout, notification, plugins, and repo visible before a trigger is chosen", () => {
    const draft = createEmptyAutomationDraft("conv-1");

    render(<AutomationInterviewDraftForm draft={draft} onPatch={vi.fn()} />);

    expect(
      screen.getByTestId("automation-interview-draft-model"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-timeout"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-notification"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-plugins"),
    ).toBeInTheDocument();
    const repoBranch = screen.getByTestId(
      "automation-interview-draft-repo-branch",
    );
    expect(repoBranch).toContainElement(
      screen.getByTestId("automation-interview-draft-repository"),
    );
    expect(repoBranch).toContainElement(
      screen.getByTestId("automation-interview-draft-branch"),
    );
  });

  it("places the timeout hint under the timeout field", () => {
    render(
      <AutomationInterviewDraftForm
        draft={createEmptyAutomationDraft("conv-1")}
        onPatch={vi.fn()}
      />,
    );

    const timeout = screen.getByTestId("automation-interview-draft-timeout");
    const hint = screen.getByTestId("automation-interview-draft-timeout-hint");

    expect(hint).toHaveTextContent(I18nKey.AUTOMATIONS$TIMEOUT_HINT);
    expect(timeout.compareDocumentPosition(hint)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("lets the user set a custom interval frequency", () => {
    const onPatch = vi.fn();
    const draft = {
      ...createEmptyAutomationDraft("conv-1"),
      triggerType: "schedule" as const,
      schedulePreset: "15m" as const,
    };

    render(<AutomationInterviewDraftForm draft={draft} onPatch={onPatch} />);

    expect(
      screen.getByTestId("automation-interview-draft-interval-value"),
    ).toHaveValue(15);

    fireEvent.change(
      screen.getByTestId("automation-interview-draft-interval-value"),
      { target: { value: "20" } },
    );

    expect(onPatch).toHaveBeenCalledWith({
      schedulePreset: "interval",
      intervalValue: 20,
      intervalUnit: "minutes",
    });
  });

  it("shows weekday and time of day for a weekly schedule", () => {
    const draft = {
      ...createEmptyAutomationDraft("conv-1"),
      triggerType: "schedule" as const,
      schedulePreset: "weekly" as const,
    };

    render(<AutomationInterviewDraftForm draft={draft} onPatch={vi.fn()} />);

    expect(
      screen.getByTestId("automation-interview-draft-weekday"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-time"),
    ).toBeInTheDocument();
  });
});
