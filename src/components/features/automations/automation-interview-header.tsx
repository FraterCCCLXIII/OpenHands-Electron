import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDeleteModal } from "#/components/features/conversation-panel/confirm-delete-modal";
import { BrandButton } from "#/components/features/settings/brand-button";
import { BackNavButton } from "#/components/shared/buttons/back-nav-button";
import { useAutomationCreateInterview } from "#/hooks/use-automation-create-interview";
import { useLeaveAutomationInterview } from "#/hooks/use-leave-automation-interview";
import { I18nKey } from "#/i18n/declaration";
import SparkleIcon from "#/icons/sparkle.svg?react";

interface AutomationInterviewHeaderProps {
  conversationId: string;
  leading?: ReactNode;
  isChatShown?: boolean;
  onToggleChat?: () => void;
}

export function AutomationInterviewHeader({
  conversationId,
  leading,
  isChatShown = true,
  onToggleChat,
}: AutomationInterviewHeaderProps) {
  const { t } = useTranslation("openhands");
  const interview = useAutomationCreateInterview(conversationId);
  const leaveInterview = useLeaveAutomationInterview(conversationId);

  if (!interview.draft) return null;

  const chatToggleLabel = isChatShown
    ? t(I18nKey.AUTOMATIONS$INTERVIEW_HIDE_AGENT)
    : t(I18nKey.AUTOMATIONS$INTERVIEW_SHOW_AGENT);

  return (
    <div
      data-testid="automation-interview-header"
      className="flex h-10 min-h-10 shrink-0 items-center justify-between gap-2 border-b border-[var(--oh-border)] bg-base px-3"
    >
      <div className="flex min-w-0 items-center gap-2">
        {leading}
        <BackNavButton
          testId="automation-interview-back"
          className="!p-1.5"
          onClick={leaveInterview.leave}
        >
          {t(I18nKey.BUTTON$BACK)}
        </BackNavButton>
        <h2 className="min-w-0 truncate text-sm font-medium text-content">
          {interview.draft.name.trim() ||
            t(I18nKey.AUTOMATIONS$INTERVIEW_DRAWER_TITLE)}
        </h2>
        {onToggleChat ? (
          <BrandButton
            type="button"
            variant="secondary"
            testId="automation-interview-chat-toggle"
            ariaLabel={chatToggleLabel}
            className="!h-7 !min-h-7 !px-2.5 !text-xs shrink-0"
            onClick={onToggleChat}
          >
            {chatToggleLabel}
            <SparkleIcon className="size-3.5 shrink-0" />
          </BrandButton>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <BrandButton
          type="button"
          variant="secondary"
          testId="automation-interview-drawer-save"
          className="!h-7 !min-h-7 !px-2.5 !text-xs"
          onClick={interview.saveDraft}
        >
          {t(I18nKey.AUTOMATIONS$INTERVIEW_SAVE_DRAFT)}
        </BrandButton>
        <BrandButton
          type="button"
          variant="primary"
          testId="automation-interview-drawer-create"
          className="!h-7 !min-h-7 !px-2.5 !text-xs"
          isDisabled={
            interview.isCreating ||
            interview.draft.status === "created" ||
            !interview.canCreate
          }
          aria-busy={interview.isCreating}
          onClick={interview.createAutomation}
        >
          {t(I18nKey.AUTOMATIONS$INTERVIEW_REVIEW_CREATE)}
        </BrandButton>
      </div>
      {leaveInterview.isConfirmOpen ? (
        <ConfirmDeleteModal
          title={t(I18nKey.AUTOMATIONS$INTERVIEW_DISCARD_TITLE)}
          description={t(I18nKey.AUTOMATIONS$INTERVIEW_DISCARD_DESCRIPTION)}
          onConfirm={leaveInterview.confirmDiscard}
          onCancel={leaveInterview.cancelDiscard}
        />
      ) : null}
    </div>
  );
}
