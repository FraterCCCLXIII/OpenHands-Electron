import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConversationOverviewDrawerContent } from "#/components/features/conversation/conversation-overview-drawer-content";
import {
  ConversationOverviewDrawerProvider,
  useConversationOverviewDrawer,
} from "#/components/features/conversation/conversation-overview-drawer-context";
import { CONVERSATION_OVERVIEW_DRAWER_SECTION } from "#/components/features/conversation/conversation-overview-drawer.types";
import { ActiveBackendProvider } from "#/contexts/active-backend-context";

vi.mock("#/hooks/use-conversation-overview-stats", () => ({
  useConversationOverviewStats: () => ({
    workspaceName: "demo",
  }),
}));

vi.mock("#/hooks/use-conversation-primary-repository", () => ({
  useConversationPrimaryRepository: () => ({
    repository: "openhands/agent-canvas",
    provider: "github" as const,
    branch: "main",
    isConnected: true,
  }),
}));

vi.mock("#/hooks/query/use-repository-git-items", () => ({
  useRepositoryPullRequests: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useRepositoryIssues: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("#/hooks/query/use-active-conversation", () => ({
  useActiveConversation: () => ({
    data: { selected_workspace: "/workspace/project/demo" },
  }),
}));

vi.mock("#/hooks/query/use-automation-health", () => ({
  useAutomationHealth: () => ({
    data: { status: "ok" },
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("#/hooks/query/use-automations", () => ({
  useAutomations: () => ({
    data: { automations: [], total: 0 },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useToggleAutomation: () => ({ mutate: vi.fn() }),
  useDeleteAutomation: () => ({ mutate: vi.fn(), isPending: false }),
  useDispatchAutomation: () => ({ mutate: vi.fn() }),
}));

vi.mock("#/hooks/use-tracking", () => ({
  useTracking: () => ({
    trackPrebuiltAutomationEnabled: vi.fn(),
  }),
}));

vi.mock("#/hooks/use-create-automation-in-chat", () => ({
  useCreateAutomationInChat: () => vi.fn(),
}));

vi.mock("#/hooks/use-is-creating-conversation", () => ({
  useIsCreatingConversation: () => false,
}));

vi.mock("#/hooks/mutation/use-create-conversation", () => ({
  useCreateConversation: () => ({ mutate: vi.fn(), isPending: false }),
}));

function OpenSection({
  section,
}: {
  section: (typeof CONVERSATION_OVERVIEW_DRAWER_SECTION)[keyof typeof CONVERSATION_OVERVIEW_DRAWER_SECTION];
}) {
  const { openSection } = useConversationOverviewDrawer();
  return (
    <button
      type="button"
      data-testid="open-drawer-section"
      onClick={() => openSection(section)}
    >
      Open
    </button>
  );
}

function renderDrawer(
  section: (typeof CONVERSATION_OVERVIEW_DRAWER_SECTION)[keyof typeof CONVERSATION_OVERVIEW_DRAWER_SECTION],
) {
  return render(
    <ConversationOverviewDrawerProvider>
      <OpenSection section={section} />
      <ConversationOverviewDrawerContent />
    </ConversationOverviewDrawerProvider>,
    {
      wrapper: ({ children }) => (
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: { queries: { retry: false } },
            })
          }
        >
          <ActiveBackendProvider>{children}</ActiveBackendProvider>
        </QueryClientProvider>
      ),
    },
  );
}

describe("ConversationOverviewDrawerContent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("places the close button left of the title and the add control on the right", async () => {
    const user = userEvent.setup();
    renderDrawer(CONVERSATION_OVERVIEW_DRAWER_SECTION.automations);

    await user.click(screen.getByTestId("open-drawer-section"));

    const header = screen
      .getByTestId("conversation-overview-drawer-content")
      .querySelector("header");
    expect(header).not.toBeNull();
    expect(header).toHaveClass("h-10");
    expect(header).toHaveClass("min-h-10");
    expect(header).toHaveClass("pr-4");
    expect(
      within(header as HTMLElement).getByTestId(
        "conversation-overview-automations-add",
      ),
    ).toHaveClass("h-7");

    const headerItems = within(header as HTMLElement).getAllByRole("button");
    expect(headerItems[0]).toHaveAttribute(
      "data-testid",
      "conversation-overview-drawer-close",
    );
    expect(headerItems[1]).toHaveAttribute(
      "data-testid",
      "conversation-overview-automations-add",
    );
  });

  it("shows the automations add button in the header", async () => {
    const user = userEvent.setup();
    renderDrawer(CONVERSATION_OVERVIEW_DRAWER_SECTION.automations);

    await user.click(screen.getByTestId("open-drawer-section"));

    expect(
      await screen.findByTestId("conversation-overview-automations-add"),
    ).toBeInTheDocument();
  });

  it("shows the mcp add button in the header", async () => {
    const user = userEvent.setup();
    renderDrawer(CONVERSATION_OVERVIEW_DRAWER_SECTION.mcp);

    await user.click(screen.getByTestId("open-drawer-section"));

    const header = screen
      .getByTestId("conversation-overview-drawer-content")
      .querySelector("header");
    expect(
      within(header as HTMLElement).getByTestId(
        "conversation-overview-mcp-add-server",
      ),
    ).toBeInTheDocument();
  });

  it("places the view-on-provider link in the header for pull requests", async () => {
    const user = userEvent.setup();
    renderDrawer(CONVERSATION_OVERVIEW_DRAWER_SECTION.pull_requests);

    await user.click(screen.getByTestId("open-drawer-section"));

    const header = screen
      .getByTestId("conversation-overview-drawer-content")
      .querySelector("header");
    const externalLink = within(header as HTMLElement).getByTestId(
      "conversation-overview-pull_requests-open-external",
    );

    expect(externalLink).toHaveAttribute(
      "href",
      "https://github.com/openhands/agent-canvas/pulls",
    );
    expect(externalLink).toHaveTextContent(
      "CONVERSATION$OVERVIEW_VIEW_ON_PROVIDER",
    );
    expect(
      screen
        .getByTestId("conversation-overview-pull_requests-panel")
        .querySelector(
          '[data-testid="conversation-overview-pull_requests-open-external"]',
        ),
    ).toBeNull();
  });
});
