import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AutomationInterviewFrequencyField } from "#/components/features/automations/automation-interview-frequency-field";
import {
  createEmptyAutomationDraft,
  type AutomationCreateDraft,
} from "#/utils/automation-create-interview";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

function StatefulFrequencyField({
  initialDraft,
}: {
  initialDraft: AutomationCreateDraft;
}) {
  const [draft, setDraft] = useState(initialDraft);
  return (
    <AutomationInterviewFrequencyField
      draft={draft}
      onPatch={(patch) => setDraft((current) => ({ ...current, ...patch }))}
    />
  );
}

describe("AutomationInterviewFrequencyField", () => {
  it("renders segmented frequency tabs and the At time row for daily", () => {
    const draft = {
      ...createEmptyAutomationDraft("conv-1"),
      triggerType: "schedule" as const,
      schedulePreset: "daily" as const,
      scheduleFrequencyTab: "daily" as const,
    };

    render(
      <AutomationInterviewFrequencyField draft={draft} onPatch={vi.fn()} />,
    );

    expect(
      screen.getByTestId("automation-interview-draft-schedule"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-schedule-option-daily"),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByTestId("automation-interview-draft-time"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-cron"),
    ).not.toBeInTheDocument();
  });

  it("shows a datetime selector for the once tab", async () => {
    const user = userEvent.setup();

    render(
      <StatefulFrequencyField
        initialDraft={{
          ...createEmptyAutomationDraft("conv-1"),
          triggerType: "schedule",
          schedulePreset: "daily",
        }}
      />,
    );

    await user.click(
      screen.getByTestId("automation-interview-draft-schedule-option-once"),
    );

    expect(
      screen.getByTestId("automation-interview-draft-datetime"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("automation-interview-draft-time"),
    ).not.toBeInTheDocument();
  });

  it("shows the cron field only for the custom tab", async () => {
    const user = userEvent.setup();

    render(
      <StatefulFrequencyField
        initialDraft={{
          ...createEmptyAutomationDraft("conv-1"),
          triggerType: "schedule",
          schedulePreset: "daily",
        }}
      />,
    );

    await user.click(
      screen.getByTestId("automation-interview-draft-schedule-option-custom"),
    );

    expect(
      screen.getByTestId("automation-interview-draft-cron"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-timezone"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-schedule-details"),
    ).toContainElement(screen.getByTestId("automation-interview-draft-cron"));
    expect(
      screen.queryByTestId("automation-interview-draft-time"),
    ).not.toBeInTheDocument();
  });

  it("patches the draft when a frequency tab is selected", async () => {
    const user = userEvent.setup();
    const onPatch = vi.fn();
    const draft = {
      ...createEmptyAutomationDraft("conv-1"),
      triggerType: "schedule" as const,
      schedulePreset: "daily" as const,
    };

    render(
      <AutomationInterviewFrequencyField draft={draft} onPatch={onPatch} />,
    );

    await user.click(
      screen.getByTestId("automation-interview-draft-schedule-option-hourly"),
    );

    expect(onPatch).toHaveBeenCalledWith({
      scheduleFrequencyTab: "hourly",
      schedulePreset: "hourly",
    });
  });

  it("shows weekday selection for a weekly schedule", () => {
    const draft = {
      ...createEmptyAutomationDraft("conv-1"),
      triggerType: "schedule" as const,
      schedulePreset: "weekly" as const,
      scheduleFrequencyTab: "weekly" as const,
    };

    render(
      <AutomationInterviewFrequencyField draft={draft} onPatch={vi.fn()} />,
    );

    expect(
      screen.getByTestId("automation-interview-draft-weekday"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-time"),
    ).toBeInTheDocument();
  });
});
