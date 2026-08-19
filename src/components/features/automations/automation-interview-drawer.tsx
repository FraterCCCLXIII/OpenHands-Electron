import { AutomationInterviewDraftForm } from "#/components/features/automations/automation-interview-draft-form";
import { useAutomationCreateInterview } from "#/hooks/use-automation-create-interview";
import { cn } from "#/utils/utils";

interface AutomationInterviewDrawerProps {
  conversationId: string;
  reserveComposerSpace?: boolean;
}

export function AutomationInterviewDrawer({
  conversationId,
  reserveComposerSpace = false,
}: AutomationInterviewDrawerProps) {
  const interview = useAutomationCreateInterview(conversationId);

  if (!interview.draft) return null;

  return (
    <div
      data-testid="automation-interview-drawer"
      className={cn(reserveComposerSpace ? "pb-52" : undefined)}
    >
      <AutomationInterviewDraftForm
        draft={interview.draft}
        onPatch={interview.patchDraft}
      />
    </div>
  );
}
