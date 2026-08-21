import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createPortal } from "react-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SidebarMobileNavProvider } from "#/components/features/sidebar/sidebar-mobile-nav-context";
import {
  NavigationProvider,
  type NavigationContextValue,
} from "#/context/navigation-context";
import { useAutomationCreateDraftStore } from "#/stores/automation-create-draft-store";

// Mutable mock state for controlling breakpoint
let mockIsMobile = false;
let mockIsRightPanelShown = false;
let mockLeftWidth = 50;
let lastResizableOptions: {
  defaultLeftWidth?: number;
  storageKey?: string;
} | null = null;

// Track ChatInterface unmount via vi.fn()
const chatInterfaceUnmount = vi.fn();

vi.mock("#/hooks/use-breakpoint", () => ({
  useBreakpoint: () => mockIsMobile,
  SIDEBAR_RAIL_COLLAPSE_MAX_WIDTH: 767,
}));

vi.mock("#/hooks/use-resizable-panels", () => ({
  useResizablePanels: (options?: {
    defaultLeftWidth?: number;
    storageKey?: string;
  }) => {
    lastResizableOptions = options ?? null;
    return {
      leftWidth: options?.defaultLeftWidth ?? mockLeftWidth,
      rightWidth: 100 - (options?.defaultLeftWidth ?? mockLeftWidth),
      isDragging: false,
      containerRef: { current: null },
      handleMouseDown: vi.fn(),
    };
  },
}));

vi.mock("#/stores/conversation-store", () => ({
  useConversationStore: () => ({
    isRightPanelShown: mockIsRightPanelShown,
  }),
}));

// Mock ChatInterface with useEffect to track mount/unmount lifecycle
vi.mock("#/components/features/chat/chat-interface", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    ChatInterface: ({
      composerDockTarget,
      onDockedComposerSubmit,
    }: {
      composerDockTarget?: HTMLElement | null;
      onDockedComposerSubmit?: () => void;
    }) => {
      React.useEffect(() => {
        return () => chatInterfaceUnmount();
      }, []);
      return (
        <>
          <div data-testid="chat-interface">Chat Interface</div>
          {composerDockTarget
            ? createPortal(
                <button
                  type="button"
                  data-testid="interview-docked-composer-submit"
                  onClick={onDockedComposerSubmit}
                />,
                composerDockTarget,
              )
            : null}
        </>
      );
    },
  };
});

vi.mock(
  "#/components/features/conversation/conversation-tabs/conversation-tab-content/conversation-tab-content",
  () => ({
    ConversationTabContent: () => <div data-testid="tab-content" />,
  }),
);

// ConversationMain now renders the conversation name and tabs inline as the
// pane headers; both reach into route/store state we don't set up here, so
// stub them out for layout-stability tests.
vi.mock(
  "#/components/features/conversation/conversation-name-with-status",
  () => ({
    ConversationNameWithStatus: () => (
      <div data-testid="conversation-name-with-status" />
    ),
  }),
);

vi.mock(
  "#/components/features/conversation/conversation-tabs/conversation-tabs",
  () => ({
    ConversationTabs: () => <div data-testid="conversation-tabs" />,
  }),
);

vi.mock(
  "#/components/features/automations/automation-interview-header",
  () => ({
    AutomationInterviewHeader: ({
      onToggleChat,
    }: {
      onToggleChat?: () => void;
    }) => (
      <div data-testid="automation-interview-header">
        <button
          type="button"
          data-testid="automation-interview-chat-toggle"
          onClick={onToggleChat}
        />
      </div>
    ),
  }),
);

vi.mock(
  "#/components/features/automations/automation-interview-drawer",
  () => ({
    AutomationInterviewDrawer: () => (
      <div data-testid="automation-interview-drawer" />
    ),
  }),
);

import {
  AUTOMATION_INTERVIEW_PANEL_STORAGE_KEY,
  ConversationMain,
  DEFAULT_AUTOMATION_INTERVIEW_LEFT_WIDTH,
  DEFAULT_CONVERSATION_LEFT_WIDTH,
  DESKTOP_CONVERSATION_PANEL_STORAGE_KEY,
} from "#/components/features/conversation/conversation-main/conversation-main";

const navigation: NavigationContextValue = {
  currentPath: "/conversations/test-conversation-id",
  conversationId: "test-conversation-id",
  isNavigating: false,
  navigate: vi.fn(),
};

function renderConversationMain() {
  return render(
    <NavigationProvider value={navigation}>
      <SidebarMobileNavProvider>
        <ConversationMain />
      </SidebarMobileNavProvider>
    </NavigationProvider>,
  );
}

describe("ConversationMain - Layout Transition Stability", () => {
  beforeEach(() => {
    mockIsMobile = false;
    mockIsRightPanelShown = false;
    mockLeftWidth = 50;
    lastResizableOptions = null;
    chatInterfaceUnmount.mockClear();
    useAutomationCreateDraftStore.setState({ drafts: {} });
  });

  it("renders ChatInterface at desktop width", () => {
    mockIsMobile = false;
    renderConversationMain();
    expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
  });

  it("renders ChatInterface at mobile width", () => {
    mockIsMobile = true;
    renderConversationMain();
    expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
  });

  it("does not unmount ChatInterface when crossing from desktop to mobile", () => {
    mockIsMobile = false;
    const { rerender } = renderConversationMain();
    expect(chatInterfaceUnmount).not.toHaveBeenCalled();

    // Cross the breakpoint to mobile
    mockIsMobile = true;
    rerender(
      <NavigationProvider value={navigation}>
        <SidebarMobileNavProvider>
          <ConversationMain />
        </SidebarMobileNavProvider>
      </NavigationProvider>,
    );

    // ChatInterface must NOT have been unmounted and remounted
    expect(chatInterfaceUnmount).not.toHaveBeenCalled();
    expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
  });

  it("does not unmount ChatInterface when crossing from mobile to desktop", () => {
    mockIsMobile = true;
    const { rerender } = renderConversationMain();
    expect(chatInterfaceUnmount).not.toHaveBeenCalled();

    // Cross the breakpoint to desktop
    mockIsMobile = false;
    rerender(
      <NavigationProvider value={navigation}>
        <SidebarMobileNavProvider>
          <ConversationMain />
        </SidebarMobileNavProvider>
      </NavigationProvider>,
    );

    // ChatInterface must NOT have been unmounted and remounted
    expect(chatInterfaceUnmount).not.toHaveBeenCalled();
    expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
  });

  it("survives rapid back-and-forth resize without unmounting ChatInterface", () => {
    mockIsMobile = false;
    const { rerender } = renderConversationMain();

    // Simulate rapid resize back and forth across the breakpoint
    for (const mobile of [true, false, true, false, true]) {
      mockIsMobile = mobile;
      rerender(
        <NavigationProvider value={navigation}>
          <SidebarMobileNavProvider>
            <ConversationMain />
          </SidebarMobileNavProvider>
        </NavigationProvider>,
      );
    }

    expect(chatInterfaceUnmount).not.toHaveBeenCalled();
    expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
  });

  it("keeps the even split for a regular conversation", () => {
    renderConversationMain();

    expect(lastResizableOptions).toEqual(
      expect.objectContaining({
        defaultLeftWidth: DEFAULT_CONVERSATION_LEFT_WIDTH,
        storageKey: DESKTOP_CONVERSATION_PANEL_STORAGE_KEY,
      }),
    );
  });

  it("shows a left divider on the files pane when the right panel is open", () => {
    mockIsRightPanelShown = true;
    renderConversationMain();

    expect(screen.getByTestId("conversation-tabs")).toBeInTheDocument();
    const handle = screen.getByTestId("conversation-panel-resize-handle");
    expect(
      handle.querySelector(".bg-\\[var\\(--oh-border\\)\\]"),
    ).not.toBeNull();
  });

  it("defaults the conversation column narrower for an automate conversation", () => {
    useAutomationCreateDraftStore.getState().ensureDraft("test-conversation-id");

    renderConversationMain();

    expect(lastResizableOptions).toEqual(
      expect.objectContaining({
        defaultLeftWidth: DEFAULT_AUTOMATION_INTERVIEW_LEFT_WIDTH,
        storageKey: AUTOMATION_INTERVIEW_PANEL_STORAGE_KEY,
      }),
    );
  });

  it("opens the interview drawer instead of Files tabs for an automate conversation", () => {
    mockIsRightPanelShown = false;
    useAutomationCreateDraftStore.getState().ensureDraft("test-conversation-id");

    renderConversationMain();

    expect(screen.getByTestId("automation-interview-drawer")).toBeInTheDocument();
    expect(screen.queryByTestId("conversation-tabs")).not.toBeInTheDocument();
    expect(screen.getByTestId("chat-interface")).toBeInTheDocument();

    const scroll = screen.getByTestId("automation-interview-scroll");
    expect(scroll).toHaveClass("overflow-y-auto");
    expect(scroll).toHaveClass("pt-5");
    expect(scroll).toContainElement(
      screen.getByTestId("automation-interview-drawer"),
    );
    expect(screen.getByTestId("conversation-right-pane")).toContainElement(
      scroll,
    );
  });

  it("can hide and restore the conversation column", async () => {
    const user = userEvent.setup();
    useAutomationCreateDraftStore.getState().ensureDraft("test-conversation-id");

    renderConversationMain();

    expect(screen.getByTestId("conversation-chat-column")).toHaveStyle({
      width: "36%",
    });
    expect(screen.getByTestId("conversation-right-pane")).toHaveStyle({
      width: "64%",
    });
    expect(screen.getByTestId("conversation-right-pane")).not.toHaveClass(
      "border-l",
    );

    await user.click(screen.getByTestId("automation-interview-chat-toggle"));

    expect(screen.getByTestId("conversation-chat-column")).toHaveStyle({
      width: "0%",
    });
    expect(screen.getByTestId("conversation-right-pane")).toHaveStyle({
      width: "100%",
    });
    expect(screen.getByTestId("conversation-right-pane")).not.toHaveClass(
      "border-l",
    );
    expect(screen.getByTestId("conversation-chat-column-content")).toHaveClass(
      "opacity-0",
    );
    expect(screen.getByTestId("conversation-chat-column-content")).toHaveStyle({
      minWidth: "360px",
    });
    expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
    expect(screen.getByTestId("interview-docked-composer")).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-scroll"),
    ).not.toContainElement(screen.getByTestId("interview-docked-composer"));

    await user.click(screen.getByTestId("automation-interview-chat-toggle"));

    expect(screen.getByTestId("conversation-chat-column")).toHaveStyle({
      width: "36%",
    });
    expect(screen.getByTestId("conversation-chat-column-content")).toHaveClass(
      "opacity-100",
    );
    expect(screen.getByTestId("conversation-right-pane")).not.toHaveClass(
      "border-l",
    );
    expect(
      screen.queryByTestId("interview-docked-composer"),
    ).not.toBeInTheDocument();
  });

  it("reopens the conversation column when the docked composer is submitted", async () => {
    const user = userEvent.setup();
    useAutomationCreateDraftStore.getState().ensureDraft("test-conversation-id");

    renderConversationMain();

    await user.click(screen.getByTestId("automation-interview-chat-toggle"));
    expect(screen.getByTestId("conversation-chat-column")).toHaveStyle({
      width: "0%",
    });

    await user.click(screen.getByTestId("interview-docked-composer-submit"));

    expect(screen.getByTestId("conversation-chat-column")).toHaveStyle({
      width: "36%",
    });
    expect(
      screen.queryByTestId("interview-docked-composer"),
    ).not.toBeInTheDocument();
  });

  it("spans the interview toolbar across both columns", () => {
    useAutomationCreateDraftStore.getState().ensureDraft("test-conversation-id");

    renderConversationMain();

    const header = screen.getByTestId("automation-interview-header");
    const split = header.nextElementSibling;

    expect(split).toContainElement(screen.getByTestId("chat-interface"));
    expect(split).toContainElement(
      screen.getByTestId("automation-interview-drawer"),
    );
    expect(screen.queryByTestId("chat-pane-header")).not.toBeInTheDocument();
  });

  it("keeps the interview fields in chat on mobile", () => {
    mockIsMobile = true;
    useAutomationCreateDraftStore.getState().ensureDraft("test-conversation-id");

    renderConversationMain();

    expect(
      screen.queryByTestId("automation-interview-drawer"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("automation-interview-header"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("chat-pane-header")).not.toBeInTheDocument();
    expect(screen.getByTestId("chat-interface")).toBeInTheDocument();
    expect(
      screen.queryByTestId("interview-docked-composer"),
    ).not.toBeInTheDocument();
  });
});
