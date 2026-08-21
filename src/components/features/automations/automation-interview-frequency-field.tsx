import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsDropdownInput } from "#/components/features/settings/settings-dropdown-input";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  formControlBorderClassName,
  formControlHeightClassName,
  formControlRadiusClassName,
  formControlSettingsFieldClassName,
  formControlSurfaceClassName,
  formControlTransitionClassName,
} from "#/utils/form-control-classes";
import {
  defaultScheduleDateTimeLocal,
  formatTimeOfDay,
  parseCronSchedule,
} from "#/utils/automation-schedule";
import {
  AUTOMATION_SCHEDULE_CRONS,
  AUTOMATION_SCHEDULE_FREQUENCY_TABS,
  AUTOMATION_TIMEZONE_OPTIONS,
  isTimedSchedulePreset,
  scheduleFrequencyTabFromPreset,
  schedulePresetFromFrequencyTab,
  showsScheduleDateTimeRow,
  showsScheduleTimeRow,
  type AutomationCreateDraft,
  type AutomationScheduleFrequencyTab,
  type AutomationSchedulePreset,
} from "#/utils/automation-create-interview";

const WEEKDAY_KEYS: I18nKey[] = [
  I18nKey.AUTOMATIONS$WEEKDAY_SUN,
  I18nKey.AUTOMATIONS$WEEKDAY_MON,
  I18nKey.AUTOMATIONS$WEEKDAY_TUE,
  I18nKey.AUTOMATIONS$WEEKDAY_WED,
  I18nKey.AUTOMATIONS$WEEKDAY_THU,
  I18nKey.AUTOMATIONS$WEEKDAY_FRI,
  I18nKey.AUTOMATIONS$WEEKDAY_SAT,
];

const FREQUENCY_TAB_LABELS: Record<AutomationScheduleFrequencyTab, I18nKey> = {
  once: I18nKey.AUTOMATIONS$FREQUENCY_ONCE,
  hourly: I18nKey.AUTOMATIONS$INTERVIEW_SCHEDULE_HOURLY,
  daily: I18nKey.AUTOMATIONS$FREQUENCY_DAILY,
  weekdays: I18nKey.AUTOMATIONS$FREQUENCY_WEEKDAYS,
  weekly: I18nKey.AUTOMATIONS$FREQUENCY_WEEKLY,
  custom: I18nKey.AUTOMATIONS$FREQUENCY_CUSTOM,
};

const inlineSettingsInputClassName =
  "!flex-row !items-center !gap-2.5 !w-auto min-w-[14rem] flex-1 [&>div:first-child]:shrink-0";

function defaultTimeOfDay(preset: AutomationSchedulePreset | null): string {
  if (!isTimedSchedulePreset(preset)) return "09:00";
  const parsed = parseCronSchedule(AUTOMATION_SCHEDULE_CRONS[preset]);
  if (parsed.kind === "custom" || parsed.hour === undefined) return "09:00";
  return formatTimeOfDay(parsed.hour, parsed.minute);
}

function frequencyTabClassName(selected: boolean) {
  return cn(
    "inline-flex h-full shrink-0 items-center rounded-md px-3 text-sm",
    formControlTransitionClassName,
    selected
      ? cn(
          formControlBorderClassName,
          formControlSurfaceClassName,
          "border-[var(--oh-interactive-hover)] text-content",
        )
      : "border border-transparent text-[var(--oh-muted)] hover:text-content",
  );
}

function frequencyGroupClassName() {
  return cn(
    formControlHeightClassName,
    formControlRadiusClassName,
    "inline-flex w-fit max-w-full min-w-0 items-center gap-0.5 overflow-x-auto bg-[var(--oh-surface-raised)] p-0.5",
  );
}

interface AutomationInterviewFrequencyFieldProps {
  draft: AutomationCreateDraft;
  onPatch: (patch: Partial<AutomationCreateDraft>) => void;
}

export function AutomationInterviewFrequencyField({
  draft,
  onPatch,
}: AutomationInterviewFrequencyFieldProps) {
  const { t } = useTranslation("openhands");
  const selectedTab =
    draft.scheduleFrequencyTab ??
    scheduleFrequencyTabFromPreset(draft.schedulePreset);
  const showTimeRow = showsScheduleTimeRow(selectedTab);
  const showDateTimeRow = showsScheduleDateTimeRow(selectedTab);
  const timezoneItems = AUTOMATION_TIMEZONE_OPTIONS.map((timezone) => ({
    key: timezone,
    label: timezone,
  }));
  const weekdayItems = WEEKDAY_KEYS.map((key, index) => ({
    key: String(index),
    label: t(key),
  }));

  const selectTab = (tab: AutomationScheduleFrequencyTab) => {
    onPatch({
      scheduleFrequencyTab: tab,
      schedulePreset: schedulePresetFromFrequencyTab(tab),
      ...(tab === "once" && !draft.scheduleDateTime.trim()
        ? { scheduleDateTime: defaultScheduleDateTimeLocal() }
        : {}),
    });
  };

  return (
    <div className="flex flex-col gap-2.5 w-full min-w-0">
      <span className="text-sm">{t(I18nKey.AUTOMATIONS$FREQUENCY)}</span>
      <div
        role="radiogroup"
        aria-label={t(I18nKey.AUTOMATIONS$FREQUENCY)}
        data-testid="automation-interview-draft-schedule"
        className={frequencyGroupClassName()}
      >
        {AUTOMATION_SCHEDULE_FREQUENCY_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="radio"
            aria-checked={selectedTab === tab}
            data-testid={`automation-interview-draft-schedule-option-${tab}`}
            className={frequencyTabClassName(selectedTab === tab)}
            onClick={() => selectTab(tab)}
          >
            {t(FREQUENCY_TAB_LABELS[tab])}
          </button>
        ))}
      </div>

      <div
        data-testid="automation-interview-draft-schedule-details"
        className="flex w-full min-w-0 items-center gap-4 overflow-x-auto"
      >
        {selectedTab === "custom" ? (
          <SettingsInput
            testId="automation-interview-draft-cron"
            name="cron"
            type="text"
            label={t(I18nKey.AUTOMATIONS$INTERVIEW_CRON_LABEL)}
            value={draft.cronExpression}
            className={inlineSettingsInputClassName}
            inputClassName="min-w-[10rem]"
            onChange={(value) =>
              onPatch({
                schedulePreset: "custom",
                scheduleFrequencyTab: "custom",
                cronExpression: value,
              })
            }
          />
        ) : null}

        {showDateTimeRow ? (
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="shrink-0 text-sm text-content">
              {t(I18nKey.AUTOMATIONS$SCHEDULE_AT)}
            </span>
            <div className="w-[15rem] min-w-0">
              <input
                data-testid="automation-interview-draft-datetime"
                name="scheduleDateTime"
                type="datetime-local"
                value={draft.scheduleDateTime || defaultScheduleDateTimeLocal()}
                onChange={(event) =>
                  onPatch({ scheduleDateTime: event.target.value })
                }
                className={cn(formControlSettingsFieldClassName, "w-full")}
              />
            </div>
          </div>
        ) : null}

        {showTimeRow ? (
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="shrink-0 text-sm text-content">
              {t(I18nKey.AUTOMATIONS$SCHEDULE_AT)}
            </span>
            <div className="w-[9.5rem] min-w-0">
              <input
                data-testid="automation-interview-draft-time"
                name="timeOfDay"
                type="time"
                value={
                  draft.timeOfDay || defaultTimeOfDay(draft.schedulePreset)
                }
                onChange={(event) => onPatch({ timeOfDay: event.target.value })}
                className={cn(formControlSettingsFieldClassName, "w-full")}
              />
            </div>
          </div>
        ) : null}

        {selectedTab === "weekly" ? (
          <SettingsDropdownInput
            testId="automation-interview-draft-weekday"
            name="weekday"
            items={weekdayItems}
            selectedKey={String(draft.weekday)}
            wrapperClassName="!w-auto shrink-0 min-w-[12rem]"
            onSelectionChange={(key) => {
              if (key === null) return;
              onPatch({ weekday: Number(key) });
            }}
          />
        ) : null}

        <SettingsDropdownInput
          testId="automation-interview-draft-timezone"
          name="timezone"
          ariaLabel={t(I18nKey.AUTOMATIONS$INTERVIEW_TIMEZONE_LABEL)}
          items={timezoneItems}
          selectedKey={draft.timezone}
          startContent={
            <Globe
              className="size-4 shrink-0 text-[var(--oh-muted)]"
              aria-hidden
            />
          }
          wrapperClassName="!w-auto shrink-0 min-w-0 [&_[data-testid=automation-interview-draft-timezone]]:!w-auto"
          inputWrapperClassName="!w-auto"
          onSelectionChange={(key) => {
            if (typeof key === "string") {
              onPatch({ timezone: key });
            }
          }}
        />
      </div>
    </div>
  );
}
