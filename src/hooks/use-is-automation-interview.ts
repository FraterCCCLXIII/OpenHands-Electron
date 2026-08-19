import { useAutomationCreateDraftStore } from "#/stores/automation-create-draft-store";
import { isAutomationInterviewDraft } from "#/utils/automation-create-interview";

export function useIsAutomationInterview(conversationId?: string | null) {
  return useAutomationCreateDraftStore((state) =>
    conversationId
      ? isAutomationInterviewDraft(state.drafts[conversationId])
      : false,
  );
}
