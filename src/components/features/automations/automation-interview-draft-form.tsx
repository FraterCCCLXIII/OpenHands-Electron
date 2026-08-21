import { useTranslation } from "react-i18next";
import { SettingsDropdownInput } from "#/components/features/settings/settings-dropdown-input";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { AutomationInterviewDraftPromptField } from "./automation-interview-draft-prompt-field";
import { AutomationInterviewFrequencyField } from "./automation-interview-frequency-field";
import { Zap } from "lucide-react";
import CalendarIcon from "#/icons/calendar.svg?react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { AutomationInterviewEventTypeField } from "./automation-interview-event-type-field";
import { AutomationInterviewOptionalFields } from "./automation-interview-optional-fields";
import {
  AUTOMATION_INTEGRATION_OPTIONS,
  type AutomationCreateDraft,
} from "#/utils/automation-create-interview";

interface AutomationInterviewDraftFormProps {
  draft: AutomationCreateDraft;
  onPatch: (patch: Partial<AutomationCreateDraft>) => void;
}

function triggerCardClassName(selected: boolean) {
  return cn(
    "rounded-lg border px-3 py-2.5 text-left transition-colors",
    selected
      ? "border-[var(--oh-interactive-hover)] bg-surface-raised text-content"
      : "border-[var(--oh-border)] bg-transparent text-content hover:border-[var(--oh-interactive-hover)] hover:bg-surface-raised",
  );
}

export function AutomationInterviewDraftForm({
  draft,
  onPatch,
}: AutomationInterviewDraftFormProps) {
  const { t } = useTranslation("openhands");

  const integrationItems = AUTOMATION_INTEGRATION_OPTIONS.map(
    (integration) => ({
      key: integration,
      label: integration,
    }),
  );

  return (
    <div
      data-testid="automation-interview-draft-form"
      className="flex flex-col gap-4"
    >
      <SettingsInput
        testId="automation-interview-draft-name"
        name="name"
        type="text"
        label={t(I18nKey.AUTOMATIONS$NAME)}
        value={draft.name}
        placeholder={t(I18nKey.AUTOMATIONS$INTERVIEW_NAME_PLACEHOLDER)}
        onChange={(value) => onPatch({ name: value })}
      />

      <AutomationInterviewDraftPromptField
        prompt={draft.prompt}
        model={draft.model}
        repository={draft.repository}
        onPatch={onPatch}
      />

      <div className="flex flex-col gap-2.5 w-full min-w-0">
        <span className="text-sm">{t(I18nKey.AUTOMATIONS$DETAIL$TRIGGER)}</span>
        <div
          role="radiogroup"
          aria-label={t(I18nKey.AUTOMATIONS$DETAIL$TRIGGER)}
          data-testid="automation-interview-draft-trigger"
          className="grid grid-cols-2 gap-2"
        >
          <button
            type="button"
            role="radio"
            aria-checked={draft.triggerType === "schedule"}
            data-testid="automation-interview-draft-trigger-option-schedule"
            className={triggerCardClassName(draft.triggerType === "schedule")}
            onClick={() => onPatch({ triggerType: "schedule" })}
          >
            <div className="flex items-start gap-2">
              <CalendarIcon
                className="mt-0.5 size-4 shrink-0 text-muted"
                aria-hidden
              />
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {t(I18nKey.AUTOMATIONS$DETAIL$TRIGGER_SCHEDULE)}
                </div>
                <div className="mt-1 text-xs text-[var(--oh-text-tertiary)]">
                  {t(I18nKey.AUTOMATIONS$INTERVIEW_TRIGGER_SCHEDULE_DESC)}
                </div>
              </div>
            </div>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={draft.triggerType === "event"}
            data-testid="automation-interview-draft-trigger-option-event"
            className={triggerCardClassName(draft.triggerType === "event")}
            onClick={() => onPatch({ triggerType: "event" })}
          >
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {t(I18nKey.AUTOMATIONS$DETAIL$TRIGGER_EVENT)}
                </div>
                <div className="mt-1 text-xs text-[var(--oh-text-tertiary)]">
                  {t(I18nKey.AUTOMATIONS$INTERVIEW_TRIGGER_EVENT_DESC)}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {draft.triggerType === "schedule" ? (
        <AutomationInterviewFrequencyField draft={draft} onPatch={onPatch} />
      ) : null}

      {draft.triggerType === "event" ? (
        <>
          <SettingsDropdownInput
            testId="automation-interview-draft-integration"
            name="integration"
            label={t(I18nKey.AUTOMATIONS$DETAIL$EVENT_SOURCE)}
            items={integrationItems}
            selectedKey={draft.integration}
            onSelectionChange={(key) => {
              if (
                typeof key === "string" &&
                AUTOMATION_INTEGRATION_OPTIONS.includes(
                  key as (typeof AUTOMATION_INTEGRATION_OPTIONS)[number],
                )
              ) {
                onPatch({
                  integration: key as AutomationCreateDraft["integration"],
                });
              }
            }}
          />
          <AutomationInterviewEventTypeField
            selectedEvents={draft.selectedEvents}
            onChange={(selectedEvents) => onPatch({ selectedEvents })}
          />
        </>
      ) : null}

      <AutomationInterviewOptionalFields
        timeout={draft.timeout}
        onPatch={onPatch}
      />
    </div>
  );
}
