import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChatActionTooltip } from "#/components/features/chat/chat-action-tooltip";
import { ConfirmDeleteModal } from "#/components/features/conversation-panel/confirm-delete-modal";
import { BrandButton } from "#/components/features/settings/brand-button";
import { BackNavButton } from "#/components/shared/buttons/back-nav-button";
import { useAutomationCreateInterview } from "#/hooks/use-automation-create-interview";
import { useLeaveAutomationInterview } from "#/hooks/use-leave-automation-interview";
import { I18nKey } from "#/i18n/declaration";
import BlockDrawerLeftIcon from "#/icons/block-drawer-left.svg?react";
import { cn } from "#/utils/utils";
import { mobileTopBarIconButtonClassName } from "#/utils/mobile-top-bar-icon-button-classes";

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
          ariaLabel={t(I18nKey.BUTTON$BACK)}
          onClick={leaveInterview.leave}
        />
        <h2 className="min-w-0 truncate text-sm font-medium text-content">
          {interview.draft.name.trim() ||
            t(I18nKey.AUTOMATIONS$INTERVIEW_DRAWER_TITLE)}
        </h2>
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
          variant="secondary"
          testId="automation-interview-drawer-test"
          className="!h-7 !min-h-7 !px-2.5 !text-xs"
          isDisabled={
            !interview.draft.isSaved ||
            interview.isCreating ||
            interview.isTesting
          }
          aria-busy={interview.isTesting}
          onClick={interview.testDraft}
        >
          {t(I18nKey.AUTOMATIONS$INTERVIEW_TEST)}
        </BrandButton>
        <BrandButton
          type="button"
          variant="primary"
          testId="automation-interview-drawer-create"
          className="!h-7 !min-h-7 !px-2.5 !text-xs"
          isDisabled={
            interview.isCreating ||
            interview.isTesting ||
            interview.draft.status === "created" ||
            !interview.canCreate
          }
          aria-busy={interview.isCreating}
          onClick={interview.createAutomation}
        >
          {t(I18nKey.AUTOMATIONS$INTERVIEW_REVIEW_CREATE)}
        </BrandButton>
        {onToggleChat ? (
          <ChatActionTooltip
            tooltip={chatToggleLabel}
            ariaLabel={chatToggleLabel}
          >
            <button
              type="button"
              data-testid="automation-interview-chat-toggle"
              aria-label={chatToggleLabel}
              aria-pressed={isChatShown}
              onClick={onToggleChat}
              className={cn(
                mobileTopBarIconButtonClassName,
                "size-7 self-center",
              )}
            >
              <BlockDrawerLeftIcon className="size-5 shrink-0" />
            </button>
          </ChatActionTooltip>
        ) : null}
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
