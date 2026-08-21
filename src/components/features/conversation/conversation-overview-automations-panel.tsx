import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AutomationCardSkeleton } from "#/components/features/automations/automation-card-skeleton";
import { AutomationGroup } from "#/components/features/automations/automation-group";
import { BackendNotConfigured } from "#/components/features/automations/backend-not-configured";
import { EmptyState } from "#/components/features/automations/empty-state";
import { ErrorState } from "#/components/features/automations/error-state";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { useNavigation } from "#/context/navigation-context";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { useAutomations } from "#/hooks/query/use-automations";
import { useAutomationHealth } from "#/hooks/query/use-automation-health";
import { useTracking } from "#/hooks/use-tracking";
import { I18nKey } from "#/i18n/declaration";
import { useAutomationCreateDraftStore } from "#/stores/automation-create-draft-store";
import { getApiErrorMessage } from "#/utils/api-error-message";
import { displayErrorToast } from "#/utils/custom-toast-handlers";

interface ConversationOverviewAutomationsPanelProps {
  openAdd: boolean;
}

const NOOP = () => undefined;

/** Reuses the existing Automations list and creation guidance in the drawer. */
export function ConversationOverviewAutomationsPanel({
  openAdd,
}: ConversationOverviewAutomationsPanelProps) {
  const { t } = useTranslation("openhands");
  const { navigate } = useNavigation();
  const { backend } = useActiveBackend();
  const { trackAutomationCreatedButton } = useTracking();
  const createConversation = useCreateConversation();
  const startDraft = useAutomationCreateDraftStore((state) => state.startDraft);
  const {
    data: health,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useAutomationHealth();
  const { data, isLoading, isError, refetch } = useAutomations({
    limit: 50,
    offset: 0,
    enabled: health?.status === "ok",
  });

  const openCreateConversation = useCallback(() => {
    if (createConversation.isPending) return;

    trackAutomationCreatedButton({ backendKind: backend.kind });
    createConversation.mutate(
      {
        query: t(I18nKey.AUTOMATIONS$CREATE_INTERVIEW_PROMPT),
        entryPoint: "automations_add",
      },
      {
        onSuccess: (conversation) => {
          startDraft(conversation.conversation_id);
          navigate?.(`/conversations/${conversation.conversation_id}`);
        },
        onError: (error) => {
          displayErrorToast(
            getApiErrorMessage(error, t(I18nKey.ERROR$GENERIC)),
          );
        },
      },
    );
  }, [
    backend.kind,
    createConversation,
    navigate,
    startDraft,
    t,
    trackAutomationCreatedButton,
  ]);

  useEffect(() => {
    if (openAdd) openCreateConversation();
  }, [openAdd, openCreateConversation]);

  // Every state renders inside the same panel container so the drawer's
  // DOM contract (one `conversation-overview-automations-panel` node) holds
  // regardless of backend health or list contents.
  let body;
  if (isHealthLoading || (health?.status === "ok" && isLoading)) {
    body = <AutomationCardSkeleton />;
  } else if (health?.status !== "ok") {
    body = <BackendNotConfigured onRetry={refetchHealth} />;
  } else if (isError) {
    body = <ErrorState onRetry={refetch} />;
  } else if (!data?.automations.length) {
    body = <EmptyState onCreateAutomation={openCreateConversation} />;
  } else {
    body = (
      <AutomationGroup
        title={t(I18nKey.CONVERSATION_PANEL$AUTOMATIONS)}
        count={data.automations.length}
        automations={data.automations}
        view="list"
        onToggle={NOOP}
        onRunNow={NOOP}
        onDelete={NOOP}
        onExport={NOOP}
      />
    );
  }

  return (
    <div data-testid="conversation-overview-automations-panel">{body}</div>
  );
}
