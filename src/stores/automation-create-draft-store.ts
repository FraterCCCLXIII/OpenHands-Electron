import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  createEmptyAutomationDraft,
  type AutomationCreateDraft,
} from "#/utils/automation-create-interview";

interface AutomationCreateDraftState {
  drafts: Record<string, AutomationCreateDraft>;
}

interface AutomationCreateDraftActions {
  ensureDraft: (conversationId: string) => void;
  patchDraft: (
    conversationId: string,
    patch: Partial<AutomationCreateDraft>,
  ) => void;
  markCreated: (conversationId: string, automationId: string) => void;
  clearDraft: (conversationId: string) => void;
}

type AutomationCreateDraftStore = AutomationCreateDraftState &
  AutomationCreateDraftActions;

const initialState: AutomationCreateDraftState = { drafts: {} };

export const useAutomationCreateDraftStore =
  create<AutomationCreateDraftStore>()(
    devtools(
      (set) => ({
        ...initialState,
        ensureDraft: (conversationId) =>
          set((state) => {
            if (state.drafts[conversationId]) return state;
            return {
              drafts: {
                ...state.drafts,
                [conversationId]: createEmptyAutomationDraft(conversationId),
              },
            };
          }),
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
        clearDraft: (conversationId) =>
          set((state) => {
            const { [conversationId]: _removed, ...drafts } = state.drafts;
            return { drafts };
          }),
      }),
      { name: "AutomationCreateDraftStore" },
    ),
  );
