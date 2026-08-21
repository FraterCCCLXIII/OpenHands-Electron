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
    data: {
      profiles: [{ name: "Fast", model: "openai/gpt-4o-mini" }],
      active_profile: "Fast",
    },
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

  it("shows schedule fields by default", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn();
    const draft = createEmptyAutomationDraft("conv-1");

    render(<AutomationInterviewDraftForm draft={draft} onPatch={onPatch} />);

    expect(
      screen.getByTestId("automation-interview-draft-trigger-option-schedule"),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByTestId("automation-interview-draft-schedule"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-time"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-timezone"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-cron"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-integration"),
    ).not.toBeInTheDocument();

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
    expect(
      screen.queryByTestId("automation-interview-draft-event-filter"),
    ).not.toBeInTheDocument();
  });

  it("nests the model picker inside the prompt container", () => {
    const draft = createEmptyAutomationDraft("conv-1");

    render(<AutomationInterviewDraftForm draft={draft} onPatch={vi.fn()} />);

    const promptStack = screen.getByTestId(
      "automation-interview-draft-prompt-stack",
    );
    const promptContainer = screen.getByTestId(
      "automation-interview-draft-prompt-container",
    );
    const promptDrawer = screen.getByTestId(
      "automation-interview-draft-prompt-drawer",
    );

    expect(promptStack).toContainElement(promptContainer);
    expect(promptStack).toContainElement(promptDrawer);
    expect(promptContainer).toContainElement(
      screen.getByTestId("automation-interview-draft-prompt"),
    );
    expect(promptContainer).toContainElement(
      screen.getByTestId("automation-interview-draft-model"),
    );
    expect(
      screen.getByTestId("automation-interview-draft-prompt-grip"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("automation-interview-draft-prompt")).toHaveClass(
      "resize-none",
    );
    expect(promptDrawer).toContainElement(
      screen.getByTestId("automation-interview-draft-repository"),
    );
    expect(
      screen.queryByTestId("automation-interview-draft-timeout"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-timeout-add"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-notification"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-plugins"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-repository"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-branch"),
    ).not.toBeInTheDocument();
  });

  it("reveals the timeout field from the add chip and removes it with x", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn();
    const draft = createEmptyAutomationDraft("conv-1");

    render(<AutomationInterviewDraftForm draft={draft} onPatch={onPatch} />);

    await user.click(
      screen.getByTestId("automation-interview-draft-timeout-add"),
    );

    expect(
      screen.getByTestId("automation-interview-draft-timeout"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-timeout-add"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByTestId("automation-interview-draft-timeout-remove"),
    );

    expect(onPatch).toHaveBeenCalledWith({ timeout: "" });
  });

  it("places the timeout hint under the timeout field", async () => {
    const user = userEvent.setup();

    render(
      <AutomationInterviewDraftForm
        draft={createEmptyAutomationDraft("conv-1")}
        onPatch={vi.fn()}
      />,
    );

    await user.click(
      screen.getByTestId("automation-interview-draft-timeout-add"),
    );

    const timeout = screen.getByTestId("automation-interview-draft-timeout");
    const hint = screen.getByTestId("automation-interview-draft-timeout-hint");

    expect(hint).toHaveTextContent(I18nKey.AUTOMATIONS$TIMEOUT_HINT);
    expect(timeout.compareDocumentPosition(hint)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("selects hourly from the segmented frequency control", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn();
    const draft = {
      ...createEmptyAutomationDraft("conv-1"),
      triggerType: "schedule" as const,
      schedulePreset: "daily" as const,
    };

    render(<AutomationInterviewDraftForm draft={draft} onPatch={onPatch} />);

    await user.click(
      screen.getByTestId("automation-interview-draft-schedule-option-hourly"),
    );

    expect(onPatch).toHaveBeenCalledWith({
      scheduleFrequencyTab: "hourly",
      schedulePreset: "hourly",
    });
  });

  it("shows weekday and time of day for a weekly schedule", () => {
    const draft = {
      ...createEmptyAutomationDraft("conv-1"),
      triggerType: "schedule" as const,
      schedulePreset: "weekly" as const,
      scheduleFrequencyTab: "weekly" as const,
    };

    render(<AutomationInterviewDraftForm draft={draft} onPatch={vi.fn()} />);

    expect(
      screen.getByTestId("automation-interview-draft-weekday"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-time"),
    ).toBeInTheDocument();
  });

  it("patches the draft model when a profile is picked from the prompt footer", () => {
    const onPatch = vi.fn();
    const draft = createEmptyAutomationDraft("conv-1");

    render(<AutomationInterviewDraftForm draft={draft} onPatch={onPatch} />);

    fireEvent.click(screen.getByTestId("automation-interview-draft-model"));
    fireEvent.click(
      screen.getByTestId("automation-interview-draft-model-option-Fast"),
    );

    expect(onPatch).toHaveBeenCalledWith({ model: "Fast" });
  });

  it("adds a repository address through the plus modal", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn();
    const draft = createEmptyAutomationDraft("conv-1");

    render(<AutomationInterviewDraftForm draft={draft} onPatch={onPatch} />);

    await user.click(
      screen.getByTestId("automation-interview-draft-repository-add"),
    );
    await user.type(
      screen.getByTestId("automation-interview-add-repository-address"),
      "github:org/repo",
    );
    await user.click(
      screen.getByTestId("automation-interview-add-repository-submit"),
    );

    expect(onPatch).toHaveBeenCalledWith({ repository: "github:org/repo" });
  });
});
