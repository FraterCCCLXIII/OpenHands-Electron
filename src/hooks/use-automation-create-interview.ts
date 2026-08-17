import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCreateInterviewAutomation } from "#/hooks/query/use-automations";
import { useSendMessage } from "#/hooks/use-send-message";
import { useNavigation } from "#/context/navigation-context";
import { useEventStore } from "#/stores/use-event-store";
import { useAutomationCreateDraftStore } from "#/stores/automation-create-draft-store";
import { createChatMessage } from "#/services/chat-service";
import { parseMessageFromEvent } from "#/components/conversation-events/chat/event-content-helpers/parse-message-from-event";
import { isMessageEvent } from "#/types/agent-server/type-guards";
import { displayErrorToast } from "#/utils/custom-toast-handlers";
import { getApiErrorMessage } from "#/utils/api-error-message";
import { I18nKey } from "#/i18n/declaration";
import {
  applyFreeTextToDraft,
  canCreateAutomationFromDraft,
  draftToAutomationSpec,
  formatInterviewReply,
  getNextInterviewField,
  parseAutomationInterviewFences,
  type AutomationCreateDraft,
  type AutomationInterviewField,
} from "#/utils/automation-create-interview";

export function useAutomationCreateInterview(conversationId: string | null) {
  const { t } = useTranslation("openhands");
  const { navigate } = useNavigation();
  const { send } = useSendMessage();
  const createMutation = useCreateInterviewAutomation();
  const events = useEventStore((state) => state.events);
  const draft = useAutomationCreateDraftStore((state) =>
    conversationId ? state.drafts[conversationId] : undefined,
  );
  const patchDraft = useAutomationCreateDraftStore((state) => state.patchDraft);
  const markCreated = useAutomationCreateDraftStore(
    (state) => state.markCreated,
  );

  const field = draft ? getNextInterviewField(draft) : null;

  useEffect(() => {
    if (!conversationId || !draft || draft.status === "created") return;

    let merged: Partial<AutomationCreateDraft> = {};
    const nextKeys = [...draft.appliedFenceKeys];
    let changed = false;

    for (const event of events) {
      if (!isMessageEvent(event) || event.llm_message.role !== "assistant") {
        continue;
      }
      const parsed = parseAutomationInterviewFences(
        parseMessageFromEvent(event),
      );
      for (const { key, patch } of parsed.draftPatches) {
        if (nextKeys.includes(key)) continue;
        nextKeys.push(key);
        merged = { ...merged, ...patch };
        changed = true;
      }
    }

    if (changed) {
      patchDraft(conversationId, { ...merged, appliedFenceKeys: nextKeys });
    }
  }, [conversationId, draft, events, patchDraft]);

  const submitField = useCallback(
    async (
      answerField: AutomationInterviewField,
      summary: string,
      patch: Partial<AutomationCreateDraft>,
    ) => {
      if (!conversationId) return;
      patchDraft(conversationId, patch);
      await send(
        createChatMessage(
          formatInterviewReply(answerField, summary),
          [],
          [],
          new Date().toISOString(),
        ),
      );
    },
    [conversationId, patchDraft, send],
  );

  const applyComposerText = useCallback(
    (text: string) => {
      if (!conversationId || !draft) return;
      const patch = applyFreeTextToDraft(draft, text);
      if (patch) patchDraft(conversationId, patch);
    },
    [conversationId, draft, patchDraft],
  );

  const createAutomation = useCallback(() => {
    if (!conversationId || !draft || !canCreateAutomationFromDraft(draft)) {
      return;
    }

    createMutation.mutate(draftToAutomationSpec(draft), {
      onSuccess: (automation) => {
        markCreated(conversationId, automation.id);
        navigate(`/automations/${automation.id}`);
      },
      onError: (error) => {
        displayErrorToast(getApiErrorMessage(error, t(I18nKey.ERROR$GENERIC)));
      },
    });
  }, [conversationId, createMutation, draft, markCreated, navigate, t]);

  return useMemo(
    () => ({
      draft,
      field,
      isCreating: createMutation.isPending,
      submitField,
      applyComposerText,
      createAutomation,
      patchDraft: (patch: Partial<AutomationCreateDraft>) => {
        if (conversationId) patchDraft(conversationId, patch);
      },
    }),
    [
      applyComposerText,
      conversationId,
      createAutomation,
      createMutation.isPending,
      draft,
      field,
      patchDraft,
      submitField,
    ],
  );
}
