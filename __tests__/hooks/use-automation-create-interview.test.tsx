import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NavigationProvider,
  type NavigationContextValue,
} from "#/context/navigation-context";
import { useAutomationCreateInterview } from "#/hooks/use-automation-create-interview";
import { useAutomationCreateDraftStore } from "#/stores/automation-create-draft-store";
import { useEventStore } from "#/stores/use-event-store";
import type { MessageEvent } from "#/types/agent-server/core";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("#/hooks/use-send-message", () => ({
  useSendMessage: () => ({ send: vi.fn() }),
}));

vi.mock("#/hooks/query/use-automations", () => ({
  useCreateInterviewAutomation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDispatchAutomation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

const navigation: NavigationContextValue = {
  currentPath: "/conversations/new-conv",
  conversationId: "new-conv",
  isNavigating: false,
  navigate: vi.fn(),
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <NavigationProvider value={navigation}>{children}</NavigationProvider>;
}

function assistantFenceEvent(text: string): MessageEvent {
  return {
    id: "evt-old-draft",
    timestamp: new Date().toISOString(),
    source: "agent",
    llm_message: {
      role: "assistant",
      content: [{ type: "text", text }],
    },
    activated_skills: [],
    extended_content: [],
  };
}

describe("useAutomationCreateInterview", () => {
  beforeEach(() => {
    useAutomationCreateDraftStore.setState({ drafts: {} });
    useEventStore.setState({
      events: [],
      eventIds: new Set(),
      uiEvents: [],
      loadedConversationId: null,
    });
  });

  it("does not copy another conversation's draft fences onto a new interview", async () => {
    useEventStore.setState({
      events: [
        assistantFenceEvent(`Here you go
\`\`\`automation-draft
{"name":"haiku automation","prompt":"Write a haiku","triggerType":"schedule"}
\`\`\`
\`\`\`automation-ui
{"field":"schedule"}
\`\`\``),
      ],
      eventIds: new Set(["evt-old-draft"]),
      uiEvents: [],
      loadedConversationId: "old-conv",
    });
    useAutomationCreateDraftStore.getState().startDraft("new-conv");

    const { result } = renderHook(
      () => useAutomationCreateInterview("new-conv"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.draft?.conversationId).toBe("new-conv");
    });

    expect(result.current.draft).toEqual(
      expect.objectContaining({
        name: "",
        prompt: "",
        triggerType: "schedule",
        schedulePreset: "daily",
        scheduleFrequencyTab: "daily",
        requestedField: null,
      }),
    );
    expect(result.current.field).toBeNull();
  });

  it("marks the draft saved when the user saves", () => {
    useAutomationCreateDraftStore.getState().startDraft("new-conv");

    const { result } = renderHook(
      () => useAutomationCreateInterview("new-conv"),
      { wrapper },
    );

    result.current.saveDraft();

    expect(
      useAutomationCreateDraftStore.getState().drafts["new-conv"]?.isSaved,
    ).toBe(true);
  });

  it("applies draft fences once the event store belongs to this conversation", async () => {
    useAutomationCreateDraftStore.getState().startDraft("new-conv");
    useEventStore.setState({
      events: [
        assistantFenceEvent(`\`\`\`automation-draft
{"name":"Standup digest","prompt":"Post a digest"}
\`\`\``),
      ],
      eventIds: new Set(["evt-old-draft"]),
      uiEvents: [],
      loadedConversationId: "new-conv",
    });

    const { result } = renderHook(
      () => useAutomationCreateInterview("new-conv"),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.draft).toEqual(
        expect.objectContaining({
          name: "Standup digest",
          prompt: "Post a digest",
        }),
      );
    });
  });
});
