import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "#/context/navigation-context";
import { useDeleteConversation } from "#/hooks/mutation/use-delete-conversation";
import { I18nKey } from "#/i18n/declaration";
import { useAutomationCreateDraftStore } from "#/stores/automation-create-draft-store";
import { getApiErrorMessage } from "#/utils/api-error-message";
import { shouldDiscardAutomationInterviewOnLeave } from "#/utils/automation-create-interview";
import { displayErrorToast } from "#/utils/custom-toast-handlers";

export function useLeaveAutomationInterview(conversationId: string | null) {
  const { t } = useTranslation("openhands");
  const { navigate } = useNavigation();
  const { mutate: deleteConversation, isPending } = useDeleteConversation();
  const draft = useAutomationCreateDraftStore((state) =>
    conversationId ? state.drafts[conversationId] : undefined,
  );
  const clearDraft = useAutomationCreateDraftStore((state) => state.clearDraft);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const leave = useCallback(() => {
    if (shouldDiscardAutomationInterviewOnLeave(draft)) {
      setIsConfirmOpen(true);
      return;
    }
    navigate("/automations");
  }, [draft, navigate]);

  const confirmDiscard = useCallback(() => {
    if (!conversationId) {
      navigate("/automations");
      return;
    }

    deleteConversation(
      { conversationId },
      {
        onSuccess: () => {
          clearDraft(conversationId);
          setIsConfirmOpen(false);
          navigate("/automations");
        },
        onError: (error) => {
          displayErrorToast(
            getApiErrorMessage(error, t(I18nKey.ERROR$GENERIC)),
          );
        },
      },
    );
  }, [clearDraft, conversationId, deleteConversation, navigate, t]);

  const cancelDiscard = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  return {
    leave,
    confirmDiscard,
    cancelDiscard,
    isConfirmOpen,
    isDiscarding: isPending,
  };
}
