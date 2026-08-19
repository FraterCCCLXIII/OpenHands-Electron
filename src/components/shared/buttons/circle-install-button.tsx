import React from "react";
import { useTranslation } from "react-i18next";
import DownloadIcon from "#/icons/u-download.svg?react";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

interface CircleInstallButtonProps {
  testId?: string;
  onInstall: () => void;
  isDisabled?: boolean;
  className?: string;
  labelKey?: I18nKey;
  tooltipKey?: I18nKey;
}

export function CircleInstallButton({
  testId,
  onInstall,
  isDisabled = false,
  className,
  labelKey = I18nKey.SETTINGS$PLUGINS_INSTALL,
  tooltipKey,
}: CircleInstallButtonProps) {
  const { t } = useTranslation("openhands");
  const resolvedTooltipKey = tooltipKey ?? labelKey;
  const ariaLabel = t(labelKey);
  const tooltipLabel = t(resolvedTooltipKey);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isDisabled) {
      return;
    }
    onInstall();
    event.currentTarget.blur();
  };

  return (
    <StyledTooltip content={tooltipLabel} placement="top">
      <button
        type="button"
        data-testid={testId}
        disabled={isDisabled}
        aria-label={ariaLabel}
        onClick={handleClick}
        className={cn(
          "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-surface-raised p-0 text-white transition-colors hover:bg-[var(--oh-interactive-hover)]",
          isDisabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <DownloadIcon aria-hidden className="size-3.5" />
      </button>
    </StyledTooltip>
  );
}
