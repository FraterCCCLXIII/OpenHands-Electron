import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BrandButton } from "#/components/features/settings/brand-button";
import { useInterviewMissingIntegrations } from "#/components/features/automations/automation-interview-missing-integrations";
import { useAutomationCreateInterview } from "#/hooks/use-automation-create-interview";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  AUTOMATION_EVENT_OPTIONS,
  AUTOMATION_INTEGRATION_OPTIONS,
  AUTOMATION_PROMPT_TOKENS,
  AUTOMATION_SCHEDULE_CHIP_PRESETS,
  AUTOMATION_TIMEZONE_OPTIONS,
  insertTokenIntoPrompt,
  resolveDraftCron,
  suggestNameFromPrompt,
  type AutomationCreateDraft,
  type AutomationEventOption,
  type AutomationSchedulePreset,
} from "#/utils/automation-create-interview";

interface AutomationInterviewPanelProps {
  conversationId: string;
}

const EVENT_LABELS: Record<AutomationEventOption, I18nKey> = {
  "pull_request.opened": I18nKey.AUTOMATIONS$INTERVIEW_EVENT_PR_OPENED,
  "pull_request.updated": I18nKey.AUTOMATIONS$INTERVIEW_EVENT_PR_UPDATED,
  "pull_request.ready_for_review": I18nKey.AUTOMATIONS$INTERVIEW_EVENT_PR_READY,
  "issues.opened": I18nKey.AUTOMATIONS$INTERVIEW_EVENT_ISSUE_OPENED,
  push: I18nKey.AUTOMATIONS$INTERVIEW_EVENT_PUSH,
};

const SCHEDULE_LABELS: Record<AutomationSchedulePreset, I18nKey> = {
  "15m": I18nKey.AUTOMATIONS$INTERVIEW_SCHEDULE_15M,
  hourly: I18nKey.AUTOMATIONS$INTERVIEW_SCHEDULE_HOURLY,
  interval: I18nKey.AUTOMATIONS$INTERVIEW_FREQUENCY_INTERVAL,
  daily: I18nKey.AUTOMATIONS$INTERVIEW_SCHEDULE_DAILY,
  weekdays: I18nKey.AUTOMATIONS$INTERVIEW_SCHEDULE_WEEKDAYS,
  weekly: I18nKey.AUTOMATIONS$INTERVIEW_SCHEDULE_WEEKLY,
  custom: I18nKey.AUTOMATIONS$INTERVIEW_SCHEDULE_CUSTOM,
};

function cardClassName(selected?: boolean) {
  return cn(
    "rounded-[15px] border px-3 py-2.5 text-left text-sm transition-colors",
    selected
      ? "border-[var(--oh-interactive-hover)] bg-surface-raised text-content"
      : "border-[var(--oh-border)] bg-transparent text-content hover:border-[var(--oh-interactive-hover)] hover:bg-surface-raised",
  );
}

export function AutomationInterviewPanel({
  conversationId,
}: AutomationInterviewPanelProps) {
  const interview = useAutomationCreateInterview(conversationId);
  const integrations = useInterviewMissingIntegrations(interview.draft);

  if (!interview.draft || !interview.field) return null;

  return (
    <div className="mb-3">
      <div
        data-testid="automation-interview-panel"
        data-field={interview.field}
        className="max-h-[280px] overflow-y-auto rounded-[15px] border border-[var(--oh-border)] bg-[var(--oh-surface)] p-4"
      >
        {interview.field === "intent" && (
          <IntentStep
            draft={interview.draft}
            onSubmit={interview.submitField}
          />
        )}
        {interview.field === "triggerType" && (
          <TriggerStep onSubmit={interview.submitField} />
        )}
        {interview.field === "schedule" && (
          <ScheduleStep
            draft={interview.draft}
            onPatch={interview.patchDraft}
            onSubmit={interview.submitField}
          />
        )}
        {interview.field === "events" && (
          <EventsStep
            draft={interview.draft}
            onPatch={interview.patchDraft}
            onSubmit={interview.submitField}
          />
        )}
        {interview.field === "name" && (
          <NameStep draft={interview.draft} onSubmit={interview.submitField} />
        )}
        {interview.field === "tokens" && (
          <TokensStep
            draft={interview.draft}
            onPatch={interview.patchDraft}
            onSubmit={interview.submitField}
          />
        )}
        {interview.field === "review" && (
          <ReviewStep
            draft={interview.draft}
            isCreating={interview.isCreating}
            isIntegrationsLoading={integrations.isLoading}
            missingCount={integrations.missing.length}
            onCreate={interview.createAutomation}
          />
        )}
      </div>
    </div>
  );
}

function StepHeader({ title, help }: { title: string; help: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-medium text-content">{title}</h3>
      <p className="mt-1 text-xs text-[var(--oh-text-tertiary)]">{help}</p>
    </div>
  );
}

function StepActions({ children }: { children?: ReactNode }) {
  const { t } = useTranslation("openhands");

  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      <p className="min-w-0 flex-1 text-xs text-[var(--oh-muted)]">
        {t(I18nKey.AUTOMATIONS$INTERVIEW_HINT)}
      </p>
      {children ? (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}

function IntentStep({
  draft,
  onSubmit,
}: {
  draft: AutomationCreateDraft;
  onSubmit: ReturnType<typeof useAutomationCreateInterview>["submitField"];
}) {
  const { t } = useTranslation("openhands");
  const [value, setValue] = useState(draft.prompt);

  return (
    <div>
      <StepHeader
        title={t(I18nKey.AUTOMATIONS$INTERVIEW_INTENT_TITLE)}
        help={t(I18nKey.AUTOMATIONS$INTERVIEW_INTENT_HELP)}
      />
      <textarea
        data-testid="automation-interview-intent"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t(I18nKey.AUTOMATIONS$INTERVIEW_INTENT_PLACEHOLDER)}
        className="min-h-[72px] w-full resize-none rounded-[12px] border border-[var(--oh-border)] bg-transparent px-3 py-2 text-sm text-content outline-none"
      />
      <StepActions>
        <BrandButton
          type="button"
          variant="primary"
          testId="automation-interview-intent-continue"
          isDisabled={!value.trim()}
          onClick={() =>
            onSubmit("intent", value.trim(), { prompt: value.trim() })
          }
        >
          {t(I18nKey.AUTOMATIONS$INTERVIEW_CONTINUE)}
        </BrandButton>
      </StepActions>
    </div>
  );
}

function TriggerStep({
  onSubmit,
}: {
  onSubmit: ReturnType<typeof useAutomationCreateInterview>["submitField"];
}) {
  const { t } = useTranslation("openhands");

  return (
    <div>
      <StepHeader
        title={t(I18nKey.AUTOMATIONS$INTERVIEW_TRIGGER_TITLE)}
        help={t(I18nKey.AUTOMATIONS$INTERVIEW_TRIGGER_HELP)}
      />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          data-testid="automation-interview-trigger-schedule"
          className={cardClassName()}
          onClick={() =>
            onSubmit("triggerType", "schedule", { triggerType: "schedule" })
          }
        >
          <div className="font-medium">
            {t(I18nKey.AUTOMATIONS$INTERVIEW_TRIGGER_SCHEDULE)}
          </div>
          <div className="mt-1 text-xs text-[var(--oh-text-tertiary)]">
            {t(I18nKey.AUTOMATIONS$INTERVIEW_TRIGGER_SCHEDULE_DESC)}
          </div>
        </button>
        <button
          type="button"
          data-testid="automation-interview-trigger-event"
          className={cardClassName()}
          onClick={() =>
            onSubmit("triggerType", "event", { triggerType: "event" })
          }
        >
          <div className="font-medium">
            {t(I18nKey.AUTOMATIONS$INTERVIEW_TRIGGER_EVENT)}
          </div>
          <div className="mt-1 text-xs text-[var(--oh-text-tertiary)]">
            {t(I18nKey.AUTOMATIONS$INTERVIEW_TRIGGER_EVENT_DESC)}
          </div>
        </button>
      </div>
      <StepActions />
    </div>
  );
}

function ScheduleStep({
  draft,
  onPatch,
  onSubmit,
}: {
  draft: AutomationCreateDraft;
  onPatch: (patch: Partial<AutomationCreateDraft>) => void;
  onSubmit: ReturnType<typeof useAutomationCreateInterview>["submitField"];
}) {
  const { t } = useTranslation("openhands");
  const cronValue =
    draft.schedulePreset && draft.schedulePreset !== "custom"
      ? resolveDraftCron(draft)
      : draft.cronExpression;
  const canContinue =
    (draft.schedulePreset && draft.schedulePreset !== "custom") ||
    draft.cronExpression.trim().length > 0;

  return (
    <div>
      <StepHeader
        title={t(I18nKey.AUTOMATIONS$INTERVIEW_SCHEDULE_TITLE)}
        help={t(I18nKey.AUTOMATIONS$INTERVIEW_SCHEDULE_HELP)}
      />
      <div className="flex flex-wrap gap-2">
        {AUTOMATION_SCHEDULE_CHIP_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            data-testid={`automation-interview-schedule-${preset}`}
            className={cardClassName(draft.schedulePreset === preset)}
            onClick={() => onPatch({ schedulePreset: preset })}
          >
            {t(SCHEDULE_LABELS[preset])}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-xs text-[var(--oh-text-tertiary)]">
        {t(I18nKey.AUTOMATIONS$INTERVIEW_CRON_LABEL)}
        <input
          data-testid="automation-interview-cron"
          value={cronValue}
          onChange={(event) =>
            onPatch({
              schedulePreset: "custom",
              cronExpression: event.target.value,
            })
          }
          className="mt-1 w-full rounded-[12px] border border-[var(--oh-border)] bg-transparent px-3 py-2 text-sm text-content outline-none"
        />
      </label>
      <label className="mt-3 block text-xs text-[var(--oh-text-tertiary)]">
        {t(I18nKey.AUTOMATIONS$INTERVIEW_TIMEZONE_LABEL)}
        <select
          data-testid="automation-interview-timezone"
          value={draft.timezone}
          onChange={(event) => onPatch({ timezone: event.target.value })}
          className="mt-1 w-full rounded-[12px] border border-[var(--oh-border)] bg-transparent px-3 py-2 text-sm text-content outline-none"
        >
          {AUTOMATION_TIMEZONE_OPTIONS.map((timezone) => (
            <option key={timezone} value={timezone}>
              {timezone}
            </option>
          ))}
        </select>
      </label>
      <StepActions>
        <BrandButton
          type="button"
          variant="primary"
          testId="automation-interview-schedule-continue"
          isDisabled={!canContinue}
          onClick={() =>
            onSubmit("schedule", resolveDraftCron(draft) || "custom", {
              schedulePreset: draft.schedulePreset,
              cronExpression: draft.cronExpression,
              timezone: draft.timezone,
            })
          }
        >
          {t(I18nKey.AUTOMATIONS$INTERVIEW_CONTINUE)}
        </BrandButton>
      </StepActions>
    </div>
  );
}

function EventsStep({
  draft,
  onPatch,
  onSubmit,
}: {
  draft: AutomationCreateDraft;
  onPatch: (patch: Partial<AutomationCreateDraft>) => void;
  onSubmit: ReturnType<typeof useAutomationCreateInterview>["submitField"];
}) {
  const { t } = useTranslation("openhands");

  const toggleEvent = (event: AutomationEventOption) => {
    const selected = draft.selectedEvents.includes(event)
      ? draft.selectedEvents.filter((item) => item !== event)
      : [...draft.selectedEvents, event];
    onPatch({ selectedEvents: selected });
  };

  return (
    <div>
      <StepHeader
        title={t(I18nKey.AUTOMATIONS$INTERVIEW_EVENTS_TITLE)}
        help={t(I18nKey.AUTOMATIONS$INTERVIEW_EVENTS_HELP)}
      />
      <label className="mb-3 block text-xs text-[var(--oh-text-tertiary)]">
        {t(I18nKey.AUTOMATIONS$INTERVIEW_INTEGRATION_LABEL)}
        <select
          data-testid="automation-interview-integration"
          value={draft.integration}
          onChange={(event) =>
            onPatch({
              integration: event.target
                .value as AutomationCreateDraft["integration"],
            })
          }
          className="mt-1 w-full rounded-[12px] border border-[var(--oh-border)] bg-transparent px-3 py-2 text-sm text-content outline-none"
        >
          {AUTOMATION_INTEGRATION_OPTIONS.map((integration) => (
            <option key={integration} value={integration}>
              {integration}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        {AUTOMATION_EVENT_OPTIONS.map((event) => (
          <button
            key={event}
            type="button"
            data-testid={`automation-interview-event-${event}`}
            className={cardClassName(draft.selectedEvents.includes(event))}
            onClick={() => toggleEvent(event)}
          >
            {t(EVENT_LABELS[event])}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-xs text-[var(--oh-text-tertiary)]">
        {t(I18nKey.AUTOMATIONS$INTERVIEW_REPO_LABEL)}
        <input
          data-testid="automation-interview-repository"
          value={draft.repository}
          onChange={(event) => onPatch({ repository: event.target.value })}
          placeholder={t(I18nKey.AUTOMATIONS$INTERVIEW_REPO_PLACEHOLDER)}
          className="mt-1 w-full rounded-[12px] border border-[var(--oh-border)] bg-transparent px-3 py-2 text-sm text-content outline-none"
        />
      </label>
      <label className="mt-3 block text-xs text-[var(--oh-text-tertiary)]">
        {t(I18nKey.AUTOMATIONS$INTERVIEW_BRANCH_LABEL)}
        <input
          data-testid="automation-interview-branch"
          value={draft.branch}
          onChange={(event) => onPatch({ branch: event.target.value })}
          className="mt-1 w-full rounded-[12px] border border-[var(--oh-border)] bg-transparent px-3 py-2 text-sm text-content outline-none"
        />
      </label>
      <StepActions>
        <BrandButton
          type="button"
          variant="primary"
          testId="automation-interview-events-continue"
          isDisabled={draft.selectedEvents.length === 0}
          onClick={() =>
            onSubmit("events", draft.selectedEvents.join(","), {
              selectedEvents: draft.selectedEvents,
              integration: draft.integration,
              repository: draft.repository,
              branch: draft.branch,
            })
          }
        >
          {t(I18nKey.AUTOMATIONS$INTERVIEW_CONTINUE)}
        </BrandButton>
      </StepActions>
    </div>
  );
}

function NameStep({
  draft,
  onSubmit,
}: {
  draft: AutomationCreateDraft;
  onSubmit: ReturnType<typeof useAutomationCreateInterview>["submitField"];
}) {
  const { t } = useTranslation("openhands");
  const [value, setValue] = useState(
    draft.name || suggestNameFromPrompt(draft.prompt),
  );

  return (
    <div>
      <StepHeader
        title={t(I18nKey.AUTOMATIONS$INTERVIEW_NAME_TITLE)}
        help={t(I18nKey.AUTOMATIONS$INTERVIEW_NAME_HELP)}
      />
      <input
        data-testid="automation-interview-name"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t(I18nKey.AUTOMATIONS$INTERVIEW_NAME_PLACEHOLDER)}
        className="w-full rounded-[12px] border border-[var(--oh-border)] bg-transparent px-3 py-2 text-sm text-content outline-none"
      />
      <StepActions>
        <BrandButton
          type="button"
          variant="primary"
          testId="automation-interview-name-continue"
          isDisabled={!value.trim()}
          onClick={() => onSubmit("name", value.trim(), { name: value.trim() })}
        >
          {t(I18nKey.AUTOMATIONS$INTERVIEW_CONTINUE)}
        </BrandButton>
      </StepActions>
    </div>
  );
}

function TokensStep({
  draft,
  onPatch,
  onSubmit,
}: {
  draft: AutomationCreateDraft;
  onPatch: (patch: Partial<AutomationCreateDraft>) => void;
  onSubmit: ReturnType<typeof useAutomationCreateInterview>["submitField"];
}) {
  const { t } = useTranslation("openhands");

  return (
    <div>
      <StepHeader
        title={t(I18nKey.AUTOMATIONS$INTERVIEW_TOKENS_TITLE)}
        help={t(I18nKey.AUTOMATIONS$INTERVIEW_TOKENS_HELP)}
      />
      <div className="flex flex-wrap gap-2">
        {AUTOMATION_PROMPT_TOKENS.map((token) => (
          <button
            key={token}
            type="button"
            data-testid={`automation-interview-token-${token}`}
            className={cardClassName()}
            onClick={() =>
              onPatch({ prompt: insertTokenIntoPrompt(draft.prompt, token) })
            }
          >
            {token}
          </button>
        ))}
      </div>
      <p className="mt-3 line-clamp-3 text-xs text-[var(--oh-text-tertiary)]">
        {draft.prompt}
      </p>
      <StepActions>
        <BrandButton
          type="button"
          variant="secondary"
          testId="automation-interview-tokens-skip"
          onClick={() => onSubmit("tokens", "skip", { tokensResolved: true })}
        >
          {t(I18nKey.AUTOMATIONS$INTERVIEW_TOKENS_SKIP)}
        </BrandButton>
        <BrandButton
          type="button"
          variant="primary"
          testId="automation-interview-tokens-continue"
          onClick={() =>
            onSubmit("tokens", "inserted", {
              prompt: draft.prompt,
              tokensResolved: true,
            })
          }
        >
          {t(I18nKey.AUTOMATIONS$INTERVIEW_CONTINUE)}
        </BrandButton>
      </StepActions>
    </div>
  );
}

function ReviewStep({
  draft,
  isCreating,
  isIntegrationsLoading,
  missingCount,
  onCreate,
}: {
  draft: AutomationCreateDraft;
  isCreating: boolean;
  isIntegrationsLoading: boolean;
  missingCount: number;
  onCreate: () => void;
}) {
  const { t } = useTranslation("openhands");
  const triggerSummary =
    draft.triggerType === "event"
      ? `${draft.integration}: ${draft.selectedEvents.join(", ")}`
      : `${resolveDraftCron(draft)} (${draft.timezone})`;
  const isBlocked = missingCount > 0;

  return (
    <div>
      <StepHeader
        title={t(I18nKey.AUTOMATIONS$INTERVIEW_REVIEW_TITLE)}
        help={draft.name}
      />
      <dl className="space-y-2 text-sm text-content">
        <div>
          <dt className="text-xs text-[var(--oh-text-tertiary)]">
            {t(I18nKey.AUTOMATIONS$INTERVIEW_TRIGGER_TITLE)}
          </dt>
          <dd>{triggerSummary}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--oh-text-tertiary)]">
            {t(I18nKey.AUTOMATIONS$INTERVIEW_INTENT_TITLE)}
          </dt>
          <dd className="line-clamp-4 whitespace-pre-wrap">{draft.prompt}</dd>
        </div>
      </dl>
      {draft.status === "created" ? (
        <p className="mt-3 text-sm text-content">
          {t(I18nKey.AUTOMATIONS$INTERVIEW_REVIEW_CREATED)}
        </p>
      ) : (
        <StepActions>
          <BrandButton
            type="button"
            variant="primary"
            testId="automation-interview-create"
            isDisabled={isCreating || isIntegrationsLoading || isBlocked}
            aria-busy={isCreating}
            onClick={onCreate}
          >
            {t(I18nKey.AUTOMATIONS$INTERVIEW_REVIEW_CREATE)}
          </BrandButton>
        </StepActions>
      )}
    </div>
  );
}
