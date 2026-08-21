import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AutomationInterviewHeader } from "#/components/features/automations/automation-interview-header";
import {
  NavigationProvider,
  type NavigationContextValue,
} from "#/context/navigation-context";
import { I18nKey } from "#/i18n/declaration";
import { useAutomationCreateDraftStore } from "#/stores/automation-create-draft-store";
import { displaySuccessToast } from "#/utils/custom-toast-handlers";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

const mockDeleteConversation = vi.fn();
vi.mock("#/hooks/mutation/use-delete-conversation", () => ({
  useDeleteConversation: () => ({
    mutate: mockDeleteConversation,
    isPending: false,
  }),
}));

vi.mock("#/hooks/use-send-message", () => ({
  useSendMessage: () => ({ send: vi.fn() }),
}));

const mockCreate = vi.fn();
const mockDispatch = vi.fn();

vi.mock("#/hooks/query/use-automations", () => ({
  useCreateInterviewAutomation: () => ({
    mutate: mockCreate,
    isPending: false,
  }),
  useDispatchAutomation: () => ({
    mutate: mockDispatch,
    isPending: false,
  }),
}));

vi.mock("#/utils/custom-toast-handlers", () => ({
  displaySuccessToast: vi.fn(),
  displayErrorToast: vi.fn(),
}));

const navigation: NavigationContextValue = {
  currentPath: "/conversations/conv-1",
  conversationId: "conv-1",
  isNavigating: false,
  navigate: vi.fn(),
};

describe("AutomationInterviewHeader", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockDispatch.mockReset();
    mockDeleteConversation.mockReset();
    mockDeleteConversation.mockImplementation((_vars, options) => {
      options?.onSuccess?.();
    });
    vi.mocked(displaySuccessToast).mockReset();
    vi.mocked(navigation.navigate).mockReset();
    useAutomationCreateDraftStore.setState({ drafts: {} });
  });

  it("renders nothing until a draft exists", () => {
    render(
      <NavigationProvider value={navigation}>
        <AutomationInterviewHeader conversationId="conv-1" />
      </NavigationProvider>,
    );

    expect(
      screen.queryByTestId("automation-interview-header"),
    ).not.toBeInTheDocument();
  });

  it("shows the draft name and actions", () => {
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      name: "Hourly haiku",
    });

    render(
      <NavigationProvider value={navigation}>
        <AutomationInterviewHeader conversationId="conv-1" />
      </NavigationProvider>,
    );

    expect(screen.getByText("Hourly haiku")).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-drawer-save"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-drawer-test"),
    ).toBeDisabled();
    expect(
      screen.getByTestId("automation-interview-drawer-create"),
    ).toBeDisabled();
    expect(screen.getByTestId("automation-interview-back")).toBeInTheDocument();
  });

  it("asks to delete an unsaved interview when going back", async () => {
    const user = userEvent.setup();
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");

    render(
      <NavigationProvider value={navigation}>
        <AutomationInterviewHeader conversationId="conv-1" />
      </NavigationProvider>,
    );

    await user.click(screen.getByTestId("automation-interview-back"));

    expect(
      screen.getByText(I18nKey.AUTOMATIONS$INTERVIEW_DISCARD_TITLE),
    ).toBeInTheDocument();
    expect(navigation.navigate).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: I18nKey.BUTTON$CANCEL }),
    );
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(
      useAutomationCreateDraftStore.getState().drafts["conv-1"],
    ).toBeDefined();

    await user.click(screen.getByTestId("automation-interview-back"));
    await user.click(
      screen.getByRole("button", { name: I18nKey.ACTION$CONFIRM_DELETE }),
    );

    expect(mockDeleteConversation).toHaveBeenCalledWith(
      { conversationId: "conv-1" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(navigation.navigate).toHaveBeenCalledWith("/automations");
    expect(
      useAutomationCreateDraftStore.getState().drafts["conv-1"],
    ).toBeUndefined();
  });

  it("returns to automations without deleting a saved draft", async () => {
    const user = userEvent.setup();
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      isSaved: true,
    });

    render(
      <NavigationProvider value={navigation}>
        <AutomationInterviewHeader conversationId="conv-1" />
      </NavigationProvider>,
    );

    await user.click(screen.getByTestId("automation-interview-back"));

    expect(
      screen.queryByRole("button", { name: I18nKey.ACTION$CONFIRM_DELETE }),
    ).not.toBeInTheDocument();
    expect(mockDeleteConversation).not.toHaveBeenCalled();
    expect(navigation.navigate).toHaveBeenCalledWith("/automations");
    expect(
      useAutomationCreateDraftStore.getState().drafts["conv-1"],
    ).toBeDefined();
  });

  it("toggles the conversation column", async () => {
    const user = userEvent.setup();
    const onToggleChat = vi.fn();
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");

    const { rerender } = render(
      <NavigationProvider value={navigation}>
        <AutomationInterviewHeader
          conversationId="conv-1"
          isChatShown
          onToggleChat={onToggleChat}
        />
      </NavigationProvider>,
    );

    const toggle = screen.getByTestId("automation-interview-chat-toggle");
    expect(toggle).toHaveAttribute(
      "aria-label",
      I18nKey.AUTOMATIONS$INTERVIEW_HIDE_AGENT,
    );
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(onToggleChat).toHaveBeenCalledTimes(1);

    rerender(
      <NavigationProvider value={navigation}>
        <AutomationInterviewHeader
          conversationId="conv-1"
          isChatShown={false}
          onToggleChat={onToggleChat}
        />
      </NavigationProvider>,
    );

    expect(
      screen.getByTestId("automation-interview-chat-toggle"),
    ).toHaveAttribute(
      "aria-label",
      I18nKey.AUTOMATIONS$INTERVIEW_SHOW_AGENT,
    );
    expect(
      screen.getByTestId("automation-interview-chat-toggle"),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("saves the draft and creates when the form is complete", async () => {
    const user = userEvent.setup();
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      name: "Hourly haiku",
      prompt: "Write a haiku",
      triggerType: "schedule",
      schedulePreset: "hourly",
    });

    render(
      <NavigationProvider value={navigation}>
        <AutomationInterviewHeader conversationId="conv-1" />
      </NavigationProvider>,
    );

    await user.click(screen.getByTestId("automation-interview-drawer-save"));
    expect(displaySuccessToast).toHaveBeenCalledWith(
      I18nKey.AUTOMATIONS$INTERVIEW_DRAFT_SAVED,
    );
    expect(
      useAutomationCreateDraftStore.getState().drafts["conv-1"]?.isSaved,
    ).toBe(true);

    await user.click(screen.getByTestId("automation-interview-drawer-create"));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Hourly haiku",
        prompt: "Write a haiku",
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("enables test after the draft is saved and dispatches a run", async () => {
    const user = userEvent.setup();
    useAutomationCreateDraftStore.getState().ensureDraft("conv-1");
    useAutomationCreateDraftStore.getState().patchDraft("conv-1", {
      name: "Hourly haiku",
      prompt: "Write a haiku",
      triggerType: "schedule",
      schedulePreset: "hourly",
      isSaved: true,
    });

    mockCreate.mockImplementation((_spec, options) => {
      options?.onSuccess?.({ id: "auto-1" });
    });
    mockDispatch.mockImplementation((_id, options) => {
      options?.onSuccess?.({});
    });

    render(
      <NavigationProvider value={navigation}>
        <AutomationInterviewHeader conversationId="conv-1" />
      </NavigationProvider>,
    );

    const testButton = screen.getByTestId("automation-interview-drawer-test");
    expect(testButton).toBeEnabled();

    await user.click(testButton);

    expect(mockCreate).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      "auto-1",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(displaySuccessToast).toHaveBeenCalledWith(
      I18nKey.AUTOMATIONS$RUN_NOW_SUCCESS,
    );
  });
});
