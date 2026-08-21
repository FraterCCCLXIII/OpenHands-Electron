import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import {
  createEmptyAutomationDraft,
  type AutomationCreateDraft,
} from "#/utils/automation-create-interview";

export const AUTOMATION_CREATE_DRAFTS_STORAGE_KEY =
  "openhands-automation-create-drafts";

interface AutomationCreateDraftState {
  drafts: Record<string, AutomationCreateDraft>;
}

interface AutomationCreateDraftActions {
  ensureDraft: (
    conversationId: string,
    initial?: Partial<AutomationCreateDraft>,
  ) => void;
  startDraft: (
    conversationId: string,
    initial?: Partial<AutomationCreateDraft>,
  ) => void;
  patchDraft: (
    conversationId: string,
    patch: Partial<AutomationCreateDraft>,
  ) => void;
  markCreated: (conversationId: string, automationId: string) => void;
  /** Move a draft from a provisional task URL id to the real conversation id. */
  reassignDraft: (fromConversationId: string, toConversationId: string) => void;
  clearDraft: (conversationId: string) => void;
}

type AutomationCreateDraftStore = AutomationCreateDraftState &
  AutomationCreateDraftActions;

const initialState: AutomationCreateDraftState = { drafts: {} };

export const useAutomationCreateDraftStore =
  create<AutomationCreateDraftStore>()(
    devtools(
      persist(
        (set) => ({
          ...initialState,
          ensureDraft: (conversationId, initial) =>
            set((state) => {
              if (state.drafts[conversationId]) return state;
              return {
                drafts: {
                  ...state.drafts,
                  [conversationId]: {
                    ...createEmptyAutomationDraft(conversationId),
                    ...initial,
                    conversationId,
                  },
                },
              };
            }),
          startDraft: (conversationId, initial) =>
            set((state) => ({
              drafts: {
                ...state.drafts,
                [conversationId]: {
                  ...createEmptyAutomationDraft(conversationId),
                  ...initial,
                  conversationId,
                },
              },
            })),
          patchDraft: (conversationId, patch) =>
            set((state) => {
              const current =
                state.drafts[conversationId] ??
                createEmptyAutomationDraft(conversationId);
              const next = { ...current, ...patch, conversationId };
              if (patch.requiredIntegrations) {
                next.requiredIntegrations = [
                  ...new Set([
                    ...current.requiredIntegrations,
                    ...patch.requiredIntegrations,
                  ]),
                ];
              }
              return {
                drafts: {
                  ...state.drafts,
                  [conversationId]: next,
                },
              };
            }),
          markCreated: (conversationId, automationId) =>
            set((state) => {
              const current = state.drafts[conversationId];
              if (!current) return state;
              return {
                drafts: {
                  ...state.drafts,
                  [conversationId]: {
                    ...current,
                    status: "created",
                    createdAutomationId: automationId,
                    tokensResolved: true,
                  },
                },
              };
            }),
          reassignDraft: (fromConversationId, toConversationId) =>
            set((state) => {
              if (fromConversationId === toConversationId) return state;
              const draft = state.drafts[fromConversationId];
              if (!draft) return state;
              const { [fromConversationId]: _removed, ...rest } = state.drafts;
              return {
                drafts: {
                  ...rest,
                  [toConversationId]: {
                    ...draft,
                    conversationId: toConversationId,
                  },
                },
              };
            }),
          clearDraft: (conversationId) =>
            set((state) => {
              const { [conversationId]: _removed, ...drafts } = state.drafts;
              return { drafts };
            }),
        }),
        {
          name: AUTOMATION_CREATE_DRAFTS_STORAGE_KEY,
          storage: createJSONStorage(() => localStorage),
        },
      ),
      { name: "AutomationCreateDraftStore" },
    ),
  );
