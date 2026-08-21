import React from "react";
import { useTranslation } from "react-i18next";
import { useLlmProfiles } from "#/hooks/query/use-llm-profiles";
import { ComboboxCaretInline } from "#/ui/combobox-caret";
import CheckIcon from "#/icons/checkmark.svg?react";
import { useClickOutsideElement } from "#/hooks/use-click-outside-element";
import { ContextMenu } from "#/ui/context-menu";
import { ContextMenuListItem } from "#/components/features/context-menu/context-menu-list-item";
import { Typography } from "#/ui/typography";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { chatInputPillButtonClassName } from "#/utils/form-control-classes";
import { formatModelNameForDisplay } from "#/utils/format-model-name";

const PROFILE_LABEL_MAX_CHARS = 18;

function truncateLabel(label: string): string {
  return label.length <= PROFILE_LABEL_MAX_CHARS
    ? label
    : `${label.slice(0, PROFILE_LABEL_MAX_CHARS)}…`;
}

interface AutomationInterviewDraftModelPickerProps {
  value: string;
  onChange: (profileName: string) => void;
}

export function AutomationInterviewDraftModelPicker({
  value,
  onChange,
}: AutomationInterviewDraftModelPickerProps) {
  const { t } = useTranslation("openhands");
  const { data, isLoading } = useLlmProfiles();
  const profiles = data?.profiles ?? [];
  const activeProfileName = data?.active_profile ?? null;
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = useClickOutsideElement<HTMLUListElement>(
    () => setIsPopoverOpen(false),
    triggerRef,
  );

  if (isLoading || profiles.length === 0) {
    return null;
  }

  const pinnedProfileName = value.trim() || null;
  const displayProfileName = pinnedProfileName ?? activeProfileName;
  const pillLabel =
    displayProfileName ?? t(I18nKey.LLM$SELECT_MODEL_PLACEHOLDER);

  const close = () => setIsPopoverOpen(false);

  return (
    <div className="relative min-w-0">
      <button
        ref={triggerRef}
        type="button"
        className={cn(chatInputPillButtonClassName, "max-w-[200px]")}
        title={displayProfileName ?? undefined}
        data-testid="automation-interview-draft-model"
        aria-expanded={isPopoverOpen}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsPopoverOpen((open) => !open);
        }}
      >
        <span className="truncate">{truncateLabel(pillLabel)}</span>
        <ComboboxCaretInline isOpen={isPopoverOpen} />
      </button>

      {isPopoverOpen && (
        <ContextMenu
          ref={popoverRef}
          testId="automation-interview-draft-model-popover"
          position="top"
          alignment="left"
          spacing="none"
          className="z-[60] mb-2 min-w-[200px] max-w-[320px] max-h-[60vh] overflow-y-auto"
        >
          <li role="presentation" className="px-2 pt-1 pb-0.5">
            <Typography.Text className="text-[11px] font-medium text-[var(--oh-text-dim)] uppercase tracking-wide leading-4">
              {t(I18nKey.SETTINGS$AVAILABLE_PROFILES)}
            </Typography.Text>
          </li>
          <ContextMenuListItem
            testId="automation-interview-draft-model-option-active"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onChange("");
              close();
            }}
            className={cn(
              "flex items-center justify-between gap-2",
              !pinnedProfileName && "bg-[var(--oh-interactive-hover)]",
            )}
          >
            <span className="truncate">{t(I18nKey.COMMON$ACTIVE_PROFILE)}</span>
            {!pinnedProfileName ? (
              <CheckIcon className="size-4 shrink-0" aria-hidden />
            ) : null}
          </ContextMenuListItem>
          {profiles.map((profile) => {
            const isSelected = pinnedProfileName === profile.name;
            const displayModel = formatModelNameForDisplay(profile.model);
            return (
              <ContextMenuListItem
                key={profile.name}
                testId={`automation-interview-draft-model-option-${profile.name}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange(profile.name);
                  close();
                }}
                className={cn(
                  "flex flex-col items-stretch gap-0.5",
                  isSelected && "bg-[var(--oh-interactive-hover)]",
                )}
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="truncate">{profile.name}</span>
                  {isSelected ? (
                    <CheckIcon className="size-4 shrink-0" aria-hidden />
                  ) : null}
                </div>
                {displayModel ? (
                  <span className="truncate text-xs leading-4 text-[var(--oh-muted)]">
                    {displayModel}
                  </span>
                ) : null}
              </ContextMenuListItem>
            );
          })}
        </ContextMenu>
      )}
    </div>
  );
}
