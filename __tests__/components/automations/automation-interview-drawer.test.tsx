import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AutomationInterviewDrawer } from "#/components/features/automations/automation-interview-drawer";
import {
  NavigationProvider,
  type NavigationContextValue,
} from "#/context/navigation-context";
import { I18nKey } from "#/i18n/declaration";
import { useAutomationCreateDraftStore } from "#/stores/automation-create-draft-store";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("#/hooks/use-send-message", () => ({
  useSendMessage: () => ({ send: vi.fn() }),
}));

const mockCreate = vi.fn();

vi.mock("#/hooks/query/use-automations", () => ({
  useCreateInterviewAutomation: () => ({
    mutate: mockCreate,
    isPending: false,
  }),
}));

vi.mock("#/hooks/query/use-llm-profiles", () => ({
  useLlmProfiles: () => ({
    data: { profiles: [] },
    isLoading: false,
  }),
}));

const navigation: NavigationContextValue = {
  currentPath: "/conversations/conv-1",
  conversationId: "conv-1",
  isNavigating: false,
  navigate: vi.fn(),
};

describe("AutomationInterviewDrawer", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    useAutomationCreateDraftStore.setState({ drafts: {} });
  });

  it("renders nothing until a draft exists", () => {
    render(
      <NavigationProvider value={navigation}>
        <AutomationInterviewDrawer conversationId="conv-1" />
      </NavigationProvider>,
    );

    expect(
      screen.queryByTestId("automation-interview-drawer"),
    ).not.toBeInTheDocument();
  });

  it("renders the editable automation form for a draft", () => {
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      name: "Hourly haiku",
    });

    render(
      <NavigationProvider value={navigation}>
        <AutomationInterviewDrawer conversationId="conv-1" />
      </NavigationProvider>,
    );

    expect(
      screen.getByTestId("automation-interview-drawer"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-draft-form"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(I18nKey.AUTOMATIONS$INTERVIEW_DRAWER_SUBTITLE),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("automation-interview-draft-name")).toHaveValue(
      "Hourly haiku",
    );
    expect(
      screen.queryByTestId("automation-interview-header"),
    ).not.toBeInTheDocument();
  });
});
