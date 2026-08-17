import { render, screen } from "@testing-library/react";
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

  it("walks from intent to trigger cards", async () => {
    const user = userEvent.setup();
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
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

    expect(screen.getByTestId("automation-interview-panel")).toHaveAttribute(
      "data-field",
      "triggerType",
    );
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.objectContaining({
          content: expect.stringContaining(AUTOMATION_INTERVIEW_REPLY_PREFIX),
        }),
      }),
    );
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

  it("shows missing integrations during the interview, not only on review", () => {
    mockMissingIntegrations = [
      { id: "notion", name: "Notion", connectionOptions: [] },
    ];
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      prompt: "Save meeting notes in Notion",
      triggerType: "schedule",
    });
    renderPanel();

    expect(screen.getByTestId("automation-interview-panel")).toHaveAttribute(
      "data-field",
      "schedule",
    );
    expect(
      screen.getByTestId("automation-interview-missing-integrations"),
    ).toBeInTheDocument();
    expect(screen.getByText("Notion")).toBeInTheDocument();
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
    });
    renderPanel();

    expect(
      screen.getByTestId("automation-interview-missing-integrations"),
    ).toBeInTheDocument();
    expect(screen.getByText("Slack")).toBeInTheDocument();
    expect(screen.getByTestId("automation-interview-create")).toBeDisabled();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
