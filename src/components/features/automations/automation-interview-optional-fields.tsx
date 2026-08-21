import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

interface AutomationInterviewOptionalFieldsProps {
  timeout: string;
  onPatch: (patch: { timeout?: string }) => void;
}

function optionalAddChipClassName() {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center rounded-full border border-[var(--oh-border)]",
    "px-3 py-1.5 text-sm text-[var(--oh-muted)] transition-colors",
    "hover:border-[var(--oh-interactive-hover)] hover:bg-surface-raised hover:text-content",
  );
}

export function AutomationInterviewOptionalFields({
  timeout,
  onPatch,
}: AutomationInterviewOptionalFieldsProps) {
  const { t } = useTranslation("openhands");
  const [timeoutVisible, setTimeoutVisible] = useState(
    () => timeout.trim().length > 0,
  );
  const timeoutChipLabel = t(I18nKey.AUTOMATIONS$TIMEOUT_SHORT);
  const addTimeoutLabel = `${t(I18nKey.BUTTON$ADD)} ${timeoutChipLabel}`;
  const removeTimeoutLabel = `${t(I18nKey.COMMON$REMOVE)} ${timeoutChipLabel}`;

  useEffect(() => {
    if (timeout.trim()) {
      setTimeoutVisible(true);
    }
  }, [timeout]);

  const revealTimeout = () => setTimeoutVisible(true);

  const removeTimeout = () => {
    setTimeoutVisible(false);
    onPatch({ timeout: "" });
  };

  return (
    <div
      data-testid="automation-interview-draft-optional-fields"
      className="flex flex-col gap-2.5 w-full min-w-0"
    >
      <span
        data-testid="automation-interview-draft-additional-options-label"
        className="text-sm"
      >
        {t(I18nKey.AUTOMATIONS$ADDITIONAL_OPTIONS)}
      </span>

      {timeoutVisible ? (
        <div className="flex flex-col gap-2.5 w-full min-w-0">
          <SettingsInput
            testId="automation-interview-draft-timeout"
            name="timeout"
            type="number"
            label={t(I18nKey.AUTOMATIONS$TIMEOUT)}
            value={timeout}
            showOptionalTag
            min={1}
            labelEnd={
              <button
                type="button"
                data-testid="automation-interview-draft-timeout-remove"
                aria-label={removeTimeoutLabel}
                className="ml-auto inline-flex size-6 items-center justify-center rounded-md text-[var(--oh-muted)] hover:bg-white/10 hover:text-white"
                onClick={removeTimeout}
              >
                <X className="size-4" aria-hidden />
              </button>
            }
            onChange={(value) => onPatch({ timeout: value })}
          />
          <span
            data-testid="automation-interview-draft-timeout-hint"
            className="text-xs text-muted"
          >
            {t(I18nKey.AUTOMATIONS$TIMEOUT_HINT)}
          </span>
        </div>
      ) : null}

      <div
        data-testid="automation-interview-draft-optional-chips"
        className="flex flex-wrap items-center gap-2"
      >
        {!timeoutVisible ? (
          <button
            type="button"
            data-testid="automation-interview-draft-timeout-add"
            aria-label={addTimeoutLabel}
            className={optionalAddChipClassName()}
            onClick={revealTimeout}
          >
            {addTimeoutLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
