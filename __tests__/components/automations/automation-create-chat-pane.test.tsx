import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AutomationCreateChatPane } from "#/components/features/automations/automation-create-chat-pane";
import {
  NavigationProvider,
  type NavigationContextValue,
} from "#/context/navigation-context";
import { I18nKey } from "#/i18n/declaration";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("#/components/features/conversation/conversation-main/chat-interface-wrapper", () => ({
  ChatInterfaceWrapper: ({
    showGitControlBar,
  }: {
    showGitControlBar?: boolean;
  }) => (
    <div
      data-testid="stub-chat-interface"
      data-show-git-control-bar={showGitControlBar === false ? "false" : "true"}
    />
  ),
}));

vi.mock("#/contexts/websocket-provider-wrapper", () => ({
  WebSocketProviderWrapper: ({
    children,
    conversationId,
  }: {
    children: ReactNode;
    conversationId: string;
  }) => <div data-testid={`ws-${conversationId}`}>{children}</div>,
}));

vi.mock("#/wrapper/event-handler", () => ({
  EventHandler: ({ children }: { children: React.ReactNode }) => children,
}));

function renderPane(onClose = vi.fn()) {
  const navigate = vi.fn();
  const navigation: NavigationContextValue = {
    currentPath: "/automations",
    conversationId: null,
    isNavigating: false,
    navigate,
  };

  render(
    <NavigationProvider value={navigation}>
      <AutomationCreateChatPane
        conversationId="conv-create-1"
        onClose={onClose}
      />
    </NavigationProvider>,
  );

  return { onClose, navigate };
}

describe("AutomationCreateChatPane", () => {
  it("embeds chat for the created conversation", () => {
    renderPane();

    expect(screen.getByTestId("automation-create-chat-pane")).toBeInTheDocument();
    expect(screen.getByTestId("ws-conv-create-1")).toBeInTheDocument();
    expect(screen.getByTestId("stub-chat-interface")).toHaveAttribute(
      "data-show-git-control-bar",
      "false",
    );
  });

  it("closes the drawer without navigating", async () => {
    const user = userEvent.setup();
    const { onClose, navigate } = renderPane();

    await user.click(screen.getByTestId("automation-create-chat-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText(I18nKey.AUTOMATIONS$CREATE_DRAWER_CLOSE)).toBeInTheDocument();
  });

  it("opens the conversation as a full page", async () => {
    const user = userEvent.setup();
    const { navigate } = renderPane();

    await user.click(screen.getByTestId("automation-create-chat-expand"));

    expect(navigate).toHaveBeenCalledWith("/conversations/conv-create-1");
    expect(
      screen.getByLabelText(I18nKey.AUTOMATIONS$CREATE_DRAWER_OPEN_FULL_PAGE),
    ).toBeInTheDocument();
  });
});
