import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AutomationInterviewPanel } from "#/components/features/automations/automation-interview-panel";
import {
  NavigationProvider,
  type NavigationContextValue,
} from "#/context/navigation-context";
import { I18nKey } from "#/i18n/declaration";
import { useAutomationCreateDraftStore } from "#/stores/automation-create-draft-store";
import { AUTOMATION_INTERVIEW_REPLY_PREFIX } from "#/utils/automation-create-interview";

const mockSend = vi.fn();
const mockCreate = vi.fn();
const mockNavigate = vi.fn();
let mockMissingIntegrations: Array<{
  id: string;
  name: string;
  connectionOptions: unknown[];
}> = [];
let mockIntegrationsLoading = false;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("#/hooks/use-send-message", () => ({
  useSendMessage: () => ({ send: mockSend }),
}));

vi.mock("#/hooks/query/use-automations", () => ({
  useCreateInterviewAutomation: () => ({
    mutate: mockCreate,
    isPending: false,
  }),
}));

vi.mock("#/hooks/query/use-missing-catalog-integrations", () => ({
  useMissingCatalogIntegrations: () => ({
    missing: mockMissingIntegrations,
    installedServers: [],
    isLoading: mockIntegrationsLoading,
  }),
}));

function renderPanel(conversationId = "conv-1") {
  const navigation: NavigationContextValue = {
    currentPath: "/automations",
    conversationId,
    isNavigating: false,
    navigate: mockNavigate,
  };

  return render(
    <NavigationProvider value={navigation}>
      <AutomationInterviewPanel conversationId={conversationId} />
    </NavigationProvider>,
  );
}

describe("AutomationInterviewPanel", () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockCreate.mockReset();
    mockNavigate.mockReset();
    mockMissingIntegrations = [];
    mockIntegrationsLoading = false;
    useAutomationCreateDraftStore.setState({ drafts: {} });
  });

  it("renders nothing until a draft exists", () => {
    renderPanel();

    expect(
      screen.queryByTestId("automation-interview-panel"),
    ).not.toBeInTheDocument();
  });

  it("hides the picker until the agent requests a field", () => {
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    renderPanel();

    expect(
      screen.queryByTestId("automation-interview-panel"),
    ).not.toBeInTheDocument();
  });

  it("does not show the intent picker when the launch prompt is already known", () => {
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      prompt: "Write a haiku every morning",
      requestedField: "intent",
    });
    renderPanel();

    expect(
      screen.queryByTestId("automation-interview-panel"),
    ).not.toBeInTheDocument();
  });

  it("walks from intent to trigger cards when the agent requests them", async () => {
    const user = userEvent.setup();
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      requestedField: "intent",
    });
    renderPanel();

    expect(screen.getByTestId("automation-interview-panel")).toHaveAttribute(
      "data-field",
      "intent",
    );

    await user.type(
      screen.getByTestId("automation-interview-intent"),
      "Post a standup digest",
    );
    await user.click(
      screen.getByTestId("automation-interview-intent-continue"),
    );

    expect(
      screen.queryByTestId("automation-interview-panel"),
    ).not.toBeInTheDocument();
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.objectContaining({
          content: expect.stringContaining(AUTOMATION_INTERVIEW_REPLY_PREFIX),
        }),
      }),
    );

    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      requestedField: "triggerType",
    });

    await waitFor(() => {
      expect(screen.getByTestId("automation-interview-panel")).toHaveAttribute(
        "data-field",
        "triggerType",
      );
    });
    expect(
      screen.getByText(I18nKey.AUTOMATIONS$INTERVIEW_TRIGGER_SCHEDULE),
    ).toBeInTheDocument();
  });

  it("creates from a complete review draft", async () => {
    const user = userEvent.setup();
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      name: "Standup digest",
      prompt: "Post a standup digest",
      triggerType: "schedule",
      schedulePreset: "weekdays",
      tokensResolved: true,
      requestedField: "review",
    });
    renderPanel();

    expect(screen.getByTestId("automation-interview-panel")).toHaveAttribute(
      "data-field",
      "review",
    );

    await user.click(screen.getByTestId("automation-interview-create"));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Standup digest",
        prompt: "Post a standup digest",
        trigger: expect.objectContaining({
          type: "cron",
          schedule: "30 8 * * 1-5",
        }),
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("keeps the current interview step when integrations are missing", () => {
    mockMissingIntegrations = [
      { id: "notion", name: "Notion", connectionOptions: [] },
    ];
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      prompt: "Save meeting notes in Notion",
      triggerType: "schedule",
      requestedField: "schedule",
    });
    renderPanel();

    expect(screen.getByTestId("automation-interview-panel")).toHaveAttribute(
      "data-field",
      "schedule",
    );
    expect(
      screen.queryByTestId("automation-interview-missing-integrations"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("automation-interview-cron")).toBeInTheDocument();
  });

  it("keeps a cron input visible beside the schedule presets", async () => {
    const user = userEvent.setup();
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      requestedField: "schedule",
    });
    renderPanel();

    const cronInput = screen.getByTestId("automation-interview-cron");
    expect(cronInput).toHaveValue("");
    expect(
      screen.getByTestId("automation-interview-schedule-continue"),
    ).toBeDisabled();

    await user.click(screen.getByTestId("automation-interview-schedule-daily"));
    expect(cronInput).toHaveValue("0 9 * * *");
    expect(
      screen.getByTestId("automation-interview-schedule-continue"),
    ).toBeEnabled();

    await user.clear(cronInput);
    await user.type(cronInput, "*/5 * * * *");
    expect(useAutomationCreateDraftStore.getState().drafts["conv-1"]).toEqual(
      expect.objectContaining({
        schedulePreset: "custom",
        cronExpression: "*/5 * * * *",
      }),
    );
    expect(
      screen.getByTestId("automation-interview-schedule-continue"),
    ).toBeEnabled();
  });

  it("blocks create when required integrations are missing", () => {
    mockMissingIntegrations = [
      { id: "slack", name: "Slack", connectionOptions: [] },
    ];
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      name: "Standup digest",
      prompt: "Post a standup digest to Slack",
      triggerType: "schedule",
      schedulePreset: "weekdays",
      tokensResolved: true,
      requestedField: "review",
    });
    renderPanel();

    expect(
      screen.queryByTestId("automation-interview-missing-integrations"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("automation-interview-create")).toBeDisabled();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
