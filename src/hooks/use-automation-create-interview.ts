import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateInterviewAutomation,
  useDispatchAutomation,
} from "#/hooks/query/use-automations";
import { useSendMessage } from "#/hooks/use-send-message";
import { useNavigation } from "#/context/navigation-context";
import { useEventStore } from "#/stores/use-event-store";
import { useAutomationCreateDraftStore } from "#/stores/automation-create-draft-store";
import { createChatMessage } from "#/services/chat-service";
import { parseMessageFromEvent } from "#/components/conversation-events/chat/event-content-helpers/parse-message-from-event";
import { isMessageEvent } from "#/types/agent-server/type-guards";
import {
  displayErrorToast,
  displaySuccessToast,
} from "#/utils/custom-toast-handlers";
import { getApiErrorMessage } from "#/utils/api-error-message";
import { I18nKey } from "#/i18n/declaration";
import {
  applyFreeTextToDraft,
  canCreateAutomationFromDraft,
  draftToAutomationSpec,
  formatInterviewReply,
  parseAutomationInterviewFences,
  resolveVisibleInterviewField,
  type AutomationCreateDraft,
  type AutomationInterviewField,
} from "#/utils/automation-create-interview";

export function useAutomationCreateInterview(conversationId: string | null) {
  const { t } = useTranslation("openhands");
  const { navigate } = useNavigation();
  const { send } = useSendMessage();
  const createMutation = useCreateInterviewAutomation();
  const dispatchMutation = useDispatchAutomation();
  const events = useEventStore((state) => state.events);
  const loadedConversationId = useEventStore(
    (state) => state.loadedConversationId,
  );
  const draft = useAutomationCreateDraftStore((state) =>
    conversationId ? state.drafts[conversationId] : undefined,
  );
  const patchDraft = useAutomationCreateDraftStore((state) => state.patchDraft);
  const markCreated = useAutomationCreateDraftStore(
    (state) => state.markCreated,
  );

  const field = draft ? resolveVisibleInterviewField(draft) : null;

  useEffect(() => {
    if (!conversationId || !draft || draft.status === "created") return;
    // The event store is global. Do not copy another conversation's draft
    // fences onto this interview when switching or opening a new session.
    if (loadedConversationId !== conversationId) return;

    let merged: Partial<AutomationCreateDraft> = {};
    const nextKeys = [...draft.appliedFenceKeys];
    let requestedField = draft.requestedField;
    let changed = false;

    for (const event of events) {
      if (!isMessageEvent(event) || event.llm_message.role !== "assistant") {
        continue;
      }
      const parsed = parseAutomationInterviewFences(
        parseMessageFromEvent(event),
      );
      for (const { key, patch } of parsed.draftPatches) {
        const appliedKey = `draft:${key}`;
        if (nextKeys.includes(appliedKey)) continue;
        nextKeys.push(appliedKey);
        merged = { ...merged, ...patch };
        changed = true;
      }
      for (const { key, field: uiField } of parsed.uiFields) {
        const appliedKey = `ui:${key}`;
        if (nextKeys.includes(appliedKey)) continue;
        nextKeys.push(appliedKey);
        requestedField = uiField;
        changed = true;
      }
    }

    if (changed) {
      patchDraft(conversationId, {
        ...merged,
        requestedField,
        appliedFenceKeys: nextKeys,
      });
    }
  }, [conversationId, draft, events, loadedConversationId, patchDraft]);

  const submitField = useCallback(
    async (
      answerField: AutomationInterviewField,
      summary: string,
      patch: Partial<AutomationCreateDraft>,
    ) => {
      if (!conversationId) return;
      patchDraft(conversationId, { ...patch, requestedField: null });
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

  const saveDraft = useCallback(() => {
    if (!conversationId || !draft) return;
    patchDraft(conversationId, { isSaved: true });
    displaySuccessToast(t(I18nKey.AUTOMATIONS$INTERVIEW_DRAFT_SAVED));
  }, [conversationId, draft, patchDraft, t]);

  const testDraft = useCallback(() => {
    if (!conversationId || !draft?.isSaved) return;

    const dispatchTestRun = (automationId: string) => {
      dispatchMutation.mutate(automationId, {
        onSuccess: () => {
          displaySuccessToast(t(I18nKey.AUTOMATIONS$RUN_NOW_SUCCESS));
        },
        onError: (error) => {
          displayErrorToast(
            getApiErrorMessage(error, t(I18nKey.AUTOMATIONS$RUN_NOW_ERROR)),
          );
        },
      });
    };

    if (draft.createdAutomationId) {
      dispatchTestRun(draft.createdAutomationId);
      return;
    }

    if (!canCreateAutomationFromDraft(draft)) {
      displayErrorToast(t(I18nKey.AUTOMATIONS$INTERVIEW_TEST_INCOMPLETE));
      return;
    }

    createMutation.mutate(draftToAutomationSpec(draft), {
      onSuccess: (automation) => {
        patchDraft(conversationId, { createdAutomationId: automation.id });
        dispatchTestRun(automation.id);
      },
      onError: (error) => {
        displayErrorToast(getApiErrorMessage(error, t(I18nKey.ERROR$GENERIC)));
      },
    });
  }, [conversationId, createMutation, dispatchMutation, draft, patchDraft, t]);

  return useMemo(
    () => ({
      draft,
      field,
      isCreating: createMutation.isPending,
      isTesting:
        dispatchMutation.isPending ||
        (createMutation.isPending && Boolean(draft?.isSaved)),
      canCreate: draft ? canCreateAutomationFromDraft(draft) : false,
      submitField,
      applyComposerText,
      createAutomation,
      saveDraft,
      testDraft,
      patchDraft: (patch: Partial<AutomationCreateDraft>) => {
        if (conversationId) patchDraft(conversationId, patch);
      },
    }),
    [
      applyComposerText,
      conversationId,
      createAutomation,
      createMutation.isPending,
      dispatchMutation.isPending,
      draft,
      field,
      patchDraft,
      saveDraft,
      submitField,
      testDraft,
    ],
  );
}
