import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InteractiveChatBox } from "#/components/features/chat/interactive-chat-box";
import { AgentState } from "#/types/agent-state";

vi.mock("#/components/features/chat/custom-chat-input", () => ({
  CustomChatInput: ({
    composerDrawer,
    placeholder,
  }: {
    composerDrawer?: ReactNode;
    placeholder?: string;
  }) => (
    <div data-testid="stub-chat-input">
      {placeholder}
      {composerDrawer}
    </div>
  ),
}));

vi.mock("#/components/features/chat/git-control-bar", () => ({
  GitControlBar: () => <div data-testid="git-control-bar" />,
}));

vi.mock("#/hooks/query/use-active-conversation", () => ({
  useActiveConversation: () => ({ data: { id: "conv-1" } }),
}));

vi.mock("#/hooks/use-conversation-id", () => ({
  useOptionalConversationId: () => ({ conversationId: "conv-1" }),
}));

vi.mock("#/hooks/use-agent-state", () => ({
  useAgentState: () => ({ curAgentState: AgentState.AWAITING_USER_INPUT }),
}));

vi.mock("#/hooks/query/use-sub-conversation-task-polling", () => ({
  useSubConversationTaskPolling: () => ({ taskStatus: null }),
}));

vi.mock("#/hooks/chat/use-chat-attachment-upload", () => ({
  useChatAttachmentUpload: () => ({ handleUpload: vi.fn() }),
}));

vi.mock("#/hooks/chat/use-btw-interceptor", () => ({
  useBtwInterceptor: () => vi.fn(),
}));

vi.mock("#/hooks/chat/use-goal-interceptor", () => ({
  useGoalInterceptor: (_id: string, next: (message: string) => void) => next,
}));

vi.mock("#/hooks/chat/use-model-interceptor", () => ({
  useModelInterceptor: (_id: string, next: (message: string) => void) => next,
}));

vi.mock("#/stores/conversation-store", () => ({
  useConversationStore: () => ({
    images: [],
    files: [],
    imagesMarkedUploadAsFile: [],
    clearAllFiles: vi.fn(),
    subConversationTaskId: null,
  }),
}));

describe("InteractiveChatBox", () => {
  it("renders the git control bar by default", () => {
    render(<InteractiveChatBox onSubmit={vi.fn()} />);

    expect(screen.getByTestId("git-control-bar")).toBeInTheDocument();
  });

  it("renders a composer drawer on the chat input", () => {
    render(
      <InteractiveChatBox
        onSubmit={vi.fn()}
        composerDrawer={<div data-testid="composer-drawer" />}
      />,
    );

    expect(screen.getByTestId("stub-chat-input")).toContainElement(
      screen.getByTestId("composer-drawer"),
    );
  });

  it("forwards a composer placeholder", () => {
    render(
      <InteractiveChatBox
        onSubmit={vi.fn()}
        placeholder="What work do you want to automate?"
      />,
    );

    expect(screen.getByTestId("stub-chat-input")).toHaveTextContent(
      "What work do you want to automate?",
    );
  });

  it("hides the git control bar when showGitControlBar is false", () => {
    render(
      <InteractiveChatBox onSubmit={vi.fn()} showGitControlBar={false} />,
    );

    expect(screen.queryByTestId("git-control-bar")).not.toBeInTheDocument();
  });
});
