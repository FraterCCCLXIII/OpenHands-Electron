import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";
import MessageSquareXIcon from "#/icons/message-square-x.svg?react";
import { cn } from "#/utils/utils";

interface NoConversationIndicatorProps {
  className?: string;
}

export function NoConversationIndicator({
  className,
}: NoConversationIndicatorProps) {
  const { t } = useTranslation("openhands");
  const label = t(I18nKey.AUTOMATIONS$DETAIL$NO_CONVERSATION);

  return (
    <StyledTooltip content={label} placement="top">
      <span
        role="img"
        aria-label={label}
        data-testid="no-conversation-indicator"
        className={cn(
          "inline-flex shrink-0 cursor-default text-muted",
          className,
        )}
      >
        <MessageSquareXIcon className="size-4" aria-hidden />
      </span>
    </StyledTooltip>
  );
}
