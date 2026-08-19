import React from "react";
import { useTranslation } from "react-i18next";
import PlusIcon from "#/icons/u-plus.svg?react";
import CheckmarkIcon from "#/icons/checkmark.svg?react";
import RemoveIcon from "#/icons/x-mark.svg?react";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

interface CirclePlusCheckToggleProps {
  testId?: string;
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
  isDisabled?: boolean;
  className?: string;
  enableLabelKey?: I18nKey;
  disableLabelKey?: I18nKey;
  enableTooltipKey?: I18nKey;
  disableTooltipKey?: I18nKey;
  removeTooltipKey?: I18nKey;
}

export function CirclePlusBadge({
  className,
  testId,
  tooltipKey = I18nKey.AUTOMATIONS$ADD_AUTOMATION,
}: {
  className?: string;
  testId?: string;
  tooltipKey?: I18nKey;
}) {
  const { t } = useTranslation("openhands");

  return (
    <StyledTooltip content={t(tooltipKey)} placement="top">
      <span
        aria-hidden="true"
        data-testid={testId}
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-raised text-white transition-colors hover:bg-[var(--oh-interactive-hover)]",
          className,
        )}
      >
        <PlusIcon className="size-3" />
      </span>
    </StyledTooltip>
  );
}

export function CirclePlusCheckToggle({
  testId,
  isSelected,
  onToggle,
  isDisabled = false,
  className,
  enableLabelKey = I18nKey.SETTINGS$SKILLS_ENABLE_SKILL,
  disableLabelKey = I18nKey.SETTINGS$SKILLS_DISABLE_SKILL,
  enableTooltipKey = I18nKey.COMMON$ENABLE,
  disableTooltipKey,
  removeTooltipKey = I18nKey.COMMON$REMOVE,
}: CirclePlusCheckToggleProps) {
  const { t } = useTranslation("openhands");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isDisabled) {
      return;
    }
    onToggle(!isSelected);
    event.currentTarget.blur();
  };

  const selectedTooltipKey = disableTooltipKey ?? removeTooltipKey;
  const tooltipLabel = t(isSelected ? selectedTooltipKey : enableTooltipKey);
  const ariaLabel = t(isSelected ? disableLabelKey : enableLabelKey);
  const removeIconTestId = testId ? `${testId}-remove-icon` : undefined;

  return (
    <StyledTooltip content={tooltipLabel} placement="top">
      <button
        type="button"
        role="switch"
        aria-checked={isSelected}
        data-testid={testId}
        disabled={isDisabled}
        aria-label={ariaLabel}
        onClick={handleClick}
        className={cn(
          "group/toggle inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 transition-colors",
          isSelected &&
            "border border-white bg-transparent text-white [&_path]:fill-current hover:border-0 hover:bg-[rgba(248,113,113,0.14)] hover:text-[#ef4444]",
          !isSelected &&
            "border-0 bg-surface-raised text-white hover:bg-[var(--oh-interactive-hover)]",
          isDisabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        {isSelected ? (
          <>
            <CheckmarkIcon
              aria-hidden
              width={14}
              height={14}
              className="group-hover/toggle:hidden"
            />
            <RemoveIcon
              aria-hidden
              width={14}
              height={14}
              data-testid={removeIconTestId}
              className="hidden stroke-[2.5] group-hover/toggle:block"
            />
          </>
        ) : (
          <PlusIcon aria-hidden className="size-3" />
        )}
      </button>
    </StyledTooltip>
  );
}
