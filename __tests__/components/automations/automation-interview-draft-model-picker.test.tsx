import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AutomationInterviewDraftModelPicker } from "#/components/features/automations/automation-interview-draft-model-picker";
import { I18nKey } from "#/i18n/declaration";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockProfiles = [
  { name: "Fast", model: "openai/gpt-4o-mini", base_url: null, api_key_set: true },
  { name: "Smart", model: "anthropic/claude-opus", base_url: null, api_key_set: true },
];

vi.mock("#/hooks/query/use-llm-profiles", () => ({
  useLlmProfiles: () => ({
    data: { profiles: mockProfiles, active_profile: "Fast" },
    isLoading: false,
  }),
}));

describe("AutomationInterviewDraftModelPicker", () => {
  it("shows the active profile on the pill when no profile is pinned", () => {
    render(<AutomationInterviewDraftModelPicker value="" onChange={vi.fn()} />);

    expect(screen.getByTestId("automation-interview-draft-model")).toHaveTextContent(
      "Fast",
    );
  });

  it("pins a profile on the draft when one is selected", () => {
    const onChange = vi.fn();

    render(
      <AutomationInterviewDraftModelPicker value="" onChange={onChange} />,
    );

    fireEvent.click(screen.getByTestId("automation-interview-draft-model"));
    fireEvent.click(
      screen.getByTestId("automation-interview-draft-model-option-Smart"),
    );

    expect(onChange).toHaveBeenCalledWith("Smart");
  });

  it("clears the pinned profile when Active profile is selected", () => {
    const onChange = vi.fn();

    render(
      <AutomationInterviewDraftModelPicker value="Smart" onChange={onChange} />,
    );

    fireEvent.click(screen.getByTestId("automation-interview-draft-model"));
    fireEvent.click(
      screen.getByTestId("automation-interview-draft-model-option-active"),
    );

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("labels the active profile row with the shared i18n key", () => {
    render(<AutomationInterviewDraftModelPicker value="" onChange={vi.fn()} />);

    fireEvent.click(screen.getByTestId("automation-interview-draft-model"));

    expect(
      screen.getByTestId("automation-interview-draft-model-option-active"),
    ).toHaveTextContent(I18nKey.COMMON$ACTIVE_PROFILE);
  });
});
