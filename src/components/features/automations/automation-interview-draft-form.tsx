import { useTranslation } from "react-i18next";
import { SettingsDropdownInput } from "#/components/features/settings/settings-dropdown-input";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { useLlmProfiles } from "#/hooks/query/use-llm-profiles";
import { Zap } from "lucide-react";
import CalendarIcon from "#/icons/calendar.svg?react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  formControlMultilineFieldClassName,
  formControlSettingsFieldClassName,
} from "#/utils/form-control-classes";
import {
  clampScheduleInterval,
  formatTimeOfDay,
  parseCronSchedule,
  SCHEDULE_INTERVAL_UNITS,
  type ScheduleIntervalUnit,
} from "#/utils/automation-schedule";
import { AutomationInterviewEventFilterHelp } from "./automation-interview-event-filter-help";
import { AutomationInterviewEventTypeField } from "./automation-interview-event-type-field";
import {
  AUTOMATION_FREQUENCY_OPTIONS,
  AUTOMATION_INTEGRATION_OPTIONS,
  AUTOMATION_SCHEDULE_CRONS,
  AUTOMATION_TIMEZONE_OPTIONS,
  frequencyOptionFromPreset,
  isIntervalSchedulePreset,
  isTimedSchedulePreset,
  resolveDraftCron,
  resolveDraftInterval,
  type AutomationCreateDraft,
  type AutomationFrequencyOption,
  type AutomationSchedulePreset,
} from "#/utils/automation-create-interview";

interface AutomationInterviewDraftFormProps {
  draft: AutomationCreateDraft;
  onPatch: (patch: Partial<AutomationCreateDraft>) => void;
}

const ACTIVE_PROFILE_KEY = "__active__";

const WEEKDAY_KEYS: I18nKey[] = [
  I18nKey.AUTOMATIONS$WEEKDAY_SUN,
  I18nKey.AUTOMATIONS$WEEKDAY_MON,
  I18nKey.AUTOMATIONS$WEEKDAY_TUE,
  I18nKey.AUTOMATIONS$WEEKDAY_WED,
  I18nKey.AUTOMATIONS$WEEKDAY_THU,
  I18nKey.AUTOMATIONS$WEEKDAY_FRI,
  I18nKey.AUTOMATIONS$WEEKDAY_SAT,
];

const FREQUENCY_LABELS: Record<AutomationFrequencyOption, I18nKey> = {
  interval: I18nKey.AUTOMATIONS$INTERVIEW_FREQUENCY_INTERVAL,
  daily: I18nKey.AUTOMATIONS$FREQUENCY_DAILY,
  weekdays: I18nKey.AUTOMATIONS$FREQUENCY_WEEKDAYS,
  weekly: I18nKey.AUTOMATIONS$FREQUENCY_WEEKLY,
  custom: I18nKey.AUTOMATIONS$FREQUENCY_CUSTOM,
};

const INTERVAL_UNIT_LABELS: Record<ScheduleIntervalUnit, I18nKey> = {
  minutes: I18nKey.AUTOMATIONS$INTERVIEW_INTERVAL_MINUTES,
  hours: I18nKey.AUTOMATIONS$INTERVIEW_INTERVAL_HOURS,
};

function triggerCardClassName(selected: boolean) {
  return cn(
    "rounded-lg border px-3 py-2.5 text-left transition-colors",
    selected
      ? "border-[var(--oh-interactive-hover)] bg-surface-raised text-content"
      : "border-[var(--oh-border)] bg-transparent text-content hover:border-[var(--oh-interactive-hover)] hover:bg-surface-raised",
  );
}

function defaultTimeOfDay(preset: AutomationSchedulePreset | null): string {
  if (!isTimedSchedulePreset(preset)) return "09:00";
  const parsed = parseCronSchedule(AUTOMATION_SCHEDULE_CRONS[preset]);
  if (parsed.kind === "custom" || parsed.hour === undefined) return "09:00";
  return formatTimeOfDay(parsed.hour, parsed.minute);
}

export function AutomationInterviewDraftForm({
  draft,
  onPatch,
}: AutomationInterviewDraftFormProps) {
  const { t } = useTranslation("openhands");
  const { data: profilesData, isLoading: isLoadingProfiles } = useLlmProfiles();
  const profiles = profilesData?.profiles ?? [];

  const frequencyItems = AUTOMATION_FREQUENCY_OPTIONS.map((option) => ({
    key: option,
    label: t(FREQUENCY_LABELS[option]),
  }));
  const intervalUnitItems = SCHEDULE_INTERVAL_UNITS.map((unit) => ({
    key: unit,
    label: t(INTERVAL_UNIT_LABELS[unit]),
  }));
  const selectedFrequency = frequencyOptionFromPreset(draft.schedulePreset);
  const interval = resolveDraftInterval(draft);

  const timezoneItems = AUTOMATION_TIMEZONE_OPTIONS.map((timezone) => ({
    key: timezone,
    label: timezone,
  }));

  const integrationItems = AUTOMATION_INTEGRATION_OPTIONS.map(
    (integration) => ({
      key: integration,
      label: integration,
    }),
  );

  const weekdayItems = WEEKDAY_KEYS.map((key, index) => ({
    key: String(index),
    label: t(key),
  }));

  const modelItems = [
    { key: ACTIVE_PROFILE_KEY, label: t(I18nKey.COMMON$ACTIVE_PROFILE) },
    ...profiles.map((profile) => ({
      key: profile.name,
      label: profile.name,
    })),
  ];

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

      <label className="flex flex-col gap-2.5 w-full min-w-0">
        <span className="text-sm">{t(I18nKey.AUTOMATIONS$PROMPT)}</span>
        <textarea
          data-testid="automation-interview-draft-prompt"
          name="prompt"
          value={draft.prompt}
          onChange={(event) => onPatch({ prompt: event.target.value })}
          placeholder={t(I18nKey.AUTOMATIONS$INTERVIEW_INTENT_PLACEHOLDER)}
          rows={5}
          className={cn(
            formControlMultilineFieldClassName,
            "min-h-[120px] resize-y placeholder:italic",
          )}
        />
      </label>

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
        <>
          <SettingsDropdownInput
            testId="automation-interview-draft-schedule"
            name="schedule"
            label={t(I18nKey.AUTOMATIONS$FREQUENCY)}
            items={frequencyItems}
            selectedKey={selectedFrequency}
            placeholder={t(I18nKey.AUTOMATIONS$DETAIL$SCHEDULE)}
            onSelectionChange={(key) => {
              if (
                typeof key === "string" &&
                AUTOMATION_FREQUENCY_OPTIONS.includes(
                  key as AutomationFrequencyOption,
                )
              ) {
                onPatch({
                  schedulePreset: key as AutomationFrequencyOption,
                });
              }
            }}
          />
          {isIntervalSchedulePreset(draft.schedulePreset) ? (
            <div className="grid grid-cols-2 gap-2">
              <SettingsInput
                testId="automation-interview-draft-interval-value"
                name="intervalValue"
                type="number"
                min={1}
                max={interval.unit === "minutes" ? 59 : 23}
                label={t(I18nKey.AUTOMATIONS$INTERVIEW_INTERVAL_LABEL)}
                value={String(interval.value)}
                onChange={(value) => {
                  const parsed = Number(value);
                  if (!Number.isFinite(parsed)) return;
                  onPatch({
                    schedulePreset: "interval",
                    intervalValue: clampScheduleInterval(parsed, interval.unit),
                    intervalUnit: interval.unit,
                  });
                }}
              />
              <SettingsDropdownInput
                testId="automation-interview-draft-interval-unit"
                name="intervalUnit"
                label={t(I18nKey.AUTOMATIONS$INTERVIEW_INTERVAL_UNIT)}
                items={intervalUnitItems}
                selectedKey={interval.unit}
                onSelectionChange={(key) => {
                  if (key !== "minutes" && key !== "hours") return;
                  onPatch({
                    schedulePreset: "interval",
                    intervalValue: clampScheduleInterval(interval.value, key),
                    intervalUnit: key,
                  });
                }}
              />
            </div>
          ) : null}
          {draft.schedulePreset === "weekly" ? (
            <SettingsDropdownInput
              testId="automation-interview-draft-weekday"
              name="weekday"
              label={t(I18nKey.AUTOMATIONS$WEEKDAY)}
              items={weekdayItems}
              selectedKey={String(draft.weekday)}
              onSelectionChange={(key) => {
                if (key === null) return;
                onPatch({ weekday: Number(key) });
              }}
            />
          ) : null}
          {isTimedSchedulePreset(draft.schedulePreset) ? (
            <label className="flex flex-col gap-2.5 w-full min-w-0">
              <span className="text-sm">
                {t(I18nKey.AUTOMATIONS$TIME_OF_DAY)}
              </span>
              <input
                data-testid="automation-interview-draft-time"
                name="timeOfDay"
                type="time"
                value={
                  draft.timeOfDay || defaultTimeOfDay(draft.schedulePreset)
                }
                onChange={(event) => onPatch({ timeOfDay: event.target.value })}
                className={formControlSettingsFieldClassName}
              />
            </label>
          ) : null}
          <SettingsInput
            testId="automation-interview-draft-cron"
            name="cron"
            type="text"
            label={t(I18nKey.AUTOMATIONS$INTERVIEW_CRON_LABEL)}
            value={
              draft.schedulePreset && draft.schedulePreset !== "custom"
                ? resolveDraftCron(draft)
                : draft.cronExpression
            }
            onChange={(value) =>
              onPatch({
                schedulePreset: "custom",
                cronExpression: value,
              })
            }
          />
          <SettingsDropdownInput
            testId="automation-interview-draft-timezone"
            name="timezone"
            label={t(I18nKey.AUTOMATIONS$INTERVIEW_TIMEZONE_LABEL)}
            items={timezoneItems}
            selectedKey={draft.timezone}
            onSelectionChange={(key) => {
              if (typeof key === "string") {
                onPatch({ timezone: key });
              }
            }}
          />
        </>
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
          <SettingsInput
            testId="automation-interview-draft-event-filter"
            name="eventFilter"
            type="text"
            label={t(I18nKey.AUTOMATIONS$DETAIL$EVENT_FILTER)}
            value={draft.eventFilter}
            showOptionalTag
            labelEnd={<AutomationInterviewEventFilterHelp />}
            onChange={(value) => onPatch({ eventFilter: value })}
          />
        </>
      ) : null}

      <div
        data-testid="automation-interview-draft-repo-branch"
        className="grid grid-cols-2 gap-2"
      >
        <SettingsInput
          testId="automation-interview-draft-repository"
          name="repository"
          type="text"
          label={t(I18nKey.AUTOMATIONS$DETAIL$REPOSITORIES)}
          value={draft.repository}
          placeholder={t(I18nKey.AUTOMATIONS$INTERVIEW_REPO_PLACEHOLDER)}
          showOptionalTag
          onChange={(value) => onPatch({ repository: value })}
        />
        <SettingsInput
          testId="automation-interview-draft-branch"
          name="branch"
          type="text"
          label={t(I18nKey.AUTOMATIONS$INTERVIEW_BRANCH_LABEL)}
          value={draft.branch}
          showOptionalTag
          onChange={(value) => onPatch({ branch: value })}
        />
      </div>
      <SettingsDropdownInput
        testId="automation-interview-draft-model"
        name="model"
        label={t(I18nKey.AUTOMATIONS$DETAIL$MODEL)}
        items={modelItems}
        selectedKey={draft.model || ACTIVE_PROFILE_KEY}
        isLoading={isLoadingProfiles}
        showOptionalTag
        onSelectionChange={(key) => {
          onPatch({
            model: key && key !== ACTIVE_PROFILE_KEY ? String(key) : "",
          });
        }}
      />
      <div className="flex flex-col gap-2.5 w-full min-w-0">
        <SettingsInput
          testId="automation-interview-draft-timeout"
          name="timeout"
          type="number"
          label={t(I18nKey.AUTOMATIONS$TIMEOUT)}
          value={draft.timeout}
          showOptionalTag
          min={1}
          onChange={(value) => onPatch({ timeout: value })}
        />
        <span
          data-testid="automation-interview-draft-timeout-hint"
          className="text-xs text-muted"
        >
          {t(I18nKey.AUTOMATIONS$TIMEOUT_HINT)}
        </span>
      </div>
      <SettingsInput
        testId="automation-interview-draft-notification"
        name="notification"
        type="text"
        label={t(I18nKey.AUTOMATIONS$DETAIL$NOTIFICATION)}
        value={draft.notification}
        showOptionalTag
        onChange={(value) => onPatch({ notification: value })}
      />
      <SettingsInput
        testId="automation-interview-draft-plugins"
        name="plugins"
        type="text"
        label={t(I18nKey.AUTOMATIONS$DETAIL$PLUGINS)}
        value={draft.plugins}
        onChange={(value) => onPatch({ plugins: value })}
      />
    </div>
  );
}
