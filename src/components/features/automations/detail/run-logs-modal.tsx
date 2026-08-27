import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import XMarkIcon from "#/icons/x-mark.svg?react";
import {
  useBashCommandLogs,
  type SandboxIssue,
} from "#/hooks/query/use-bash-command-logs";
import type { BashOutput } from "@openhands/typescript-client";
import { cn } from "#/utils/utils";
import { modalTitleLgMediumClassName } from "#/utils/modal-classes";
import {
  AutomationRunStatus,
  type Automation,
  type AutomationRun,
} from "#/types/automation";
import { getAutomationRunDisplay } from "#/utils/automation-run-display";
import { NavigationLink } from "#/components/shared/navigation-link";
import { DebugAutomationButton } from "./debug-automation-button";
import { RunStatusBadge } from "./run-status-badge";
import {
  formatRunCost,
  formatRunMetaTimestamp,
  getMetadataEntries,
  getSystemInspection,
  shouldShowRunDebugAction,
} from "./run-logs-modal-helpers";

/**
 * Localized empty-state message key for each `SandboxIssue` reason.
 * Centralised so we don't sprinkle conditional renders for each code.
 */
const SANDBOX_ISSUE_I18N: Record<SandboxIssue, I18nKey> = {
  missing: I18nKey.AUTOMATIONS$DETAIL$LOGS_SANDBOX_MISSING,
  paused: I18nKey.AUTOMATIONS$DETAIL$LOGS_SANDBOX_PAUSED,
  starting: I18nKey.AUTOMATIONS$DETAIL$LOGS_SANDBOX_STARTING,
  errored: I18nKey.AUTOMATIONS$DETAIL$LOGS_SANDBOX_ERROR,
  unreachable: I18nKey.AUTOMATIONS$DETAIL$LOGS_SANDBOX_UNREACHABLE,
};

type LogTab = "stdout" | "stderr";

interface RunLogsModalProps {
  /** Conversation that owns the bash command. */
  conversationId: string | null;
  /** Bash command id to fetch logs for. */
  bashCommandId: string | null;
  isOpen: boolean;
  onClose: () => void;
  /** The run these logs belong to; enables the debug action for failed runs. */
  run?: AutomationRun;
  /** The parent automation, used to add context to the debug prompt. */
  automation?: Automation;
}

function concatStream(outputs: BashOutput[], key: "stdout" | "stderr"): string {
  // Outputs come back from the API sorted by timestamp, but pages can
  // arrive out-of-order, so re-sort by (timestamp, order) before
  // concatenating to keep the stream chronological.
  return [...outputs]
    .sort((a, b) => {
      const ts = a.timestamp.localeCompare(b.timestamp);
      if (ts !== 0) return ts;
      return (a.order ?? 0) - (b.order ?? 0);
    })
    .map((output) => output[key] ?? "")
    .join("");
}

function Disclosure({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-xs text-muted marker:content-none hover:text-foreground [&::-webkit-details-marker]:hidden">
        {label}
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

function InspectionCell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 bg-[var(--oh-surface)] px-3 py-3">
      <dt className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function RunInspectionSummary({ run }: { run: AutomationRun }) {
  const { t, i18n } = useTranslation("openhands");
  const display = getAutomationRunDisplay(run);
  const taskSummary = display.taskOutcome?.outcomeSummary ?? null;
  const taskStatus =
    run.status === AutomationRunStatus.COMPLETED || display.taskOutcome
      ? display.badgeStatus
      : null;
  const system = getSystemInspection(run);
  const hasSystemDetails = Boolean(
    system.error || system.statusDetail || system.context,
  );
  const metadataEntries = getMetadataEntries(display.customTaskMetadata);
  const cost = formatRunCost(run.cost);
  const when = formatRunMetaTimestamp(
    run.completed_at || run.started_at,
    i18n.language,
  );
  const metaParts = [cost, when].filter(Boolean);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="min-w-0 pr-8">
        <h2 className={modalTitleLgMediumClassName}>
          {t(I18nKey.AUTOMATIONS$DETAIL$LOGS_TITLE)}
        </h2>
        {metaParts.length > 0 ? (
          <p className="mt-1 text-xs text-muted">{metaParts.join(" · ")}</p>
        ) : null}
      </div>
      {taskSummary ? (
        <p className="text-sm leading-6 text-content">{taskSummary}</p>
      ) : null}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--oh-border)] bg-[var(--oh-border)]">
        <InspectionCell label={t(I18nKey.AUTOMATIONS$DETAIL$RUN_LABEL)}>
          <RunStatusBadge status={run.status} compact />
        </InspectionCell>
        <InspectionCell label={t(I18nKey.AUTOMATIONS$DETAIL$TASK_LABEL)}>
          {taskStatus ? (
            <RunStatusBadge status={taskStatus} compact />
          ) : !metadataEntries.length ? (
            <p className="text-xs text-muted">
              {t(I18nKey.AUTOMATIONS$DETAIL$NO_TASK_OUTCOME)}
            </p>
          ) : null}
        </InspectionCell>
      </dl>
      {hasSystemDetails ? (
        <div>
          <p className="text-xs text-muted">
            {t(I18nKey.AUTOMATIONS$DETAIL$SYSTEM_LABEL)}
          </p>
          {system.error ? (
            <p className="mt-1 break-words text-sm leading-6 text-content">
              {system.error}
            </p>
          ) : null}
          {system.statusDetail ? (
            <p className="mt-1 break-words text-sm leading-6 text-content">
              <span className="text-muted">
                {t(I18nKey.AUTOMATIONS$DETAIL$STATUS_DETAIL)}:{" "}
              </span>
              {system.statusDetail}
            </p>
          ) : null}
          {system.context ? (
            <p className="mt-1 break-words text-xs text-muted">
              {system.context}
            </p>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="text-xs text-muted">
            {t(I18nKey.AUTOMATIONS$DETAIL$SYSTEM_LABEL)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {t(I18nKey.AUTOMATIONS$DETAIL$NO_SYSTEM_ISSUES)}
          </p>
        </div>
      )}

      {metadataEntries.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {metadataEntries.map((entry) => (
            <div key={entry.key} className="min-w-0">
              <p className="text-xs text-muted">{entry.label}</p>
              <p className="mt-0.5 break-words text-sm text-content">
                {entry.value}
              </p>
            </div>
          ))}
          {display.customTaskMetadataText ? (
            <div className="sm:col-span-2">
              <Disclosure label={t(I18nKey.AUTOMATIONS$DETAIL$RAW_METADATA)}>
                <pre
                  data-testid="automation-task-metadata"
                  className="max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-4 text-muted"
                >
                  {display.customTaskMetadataText}
                </pre>
              </Disclosure>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function RunLogsModal({
  conversationId,
  bashCommandId,
  isOpen,
  onClose,
  run,
  automation,
}: RunLogsModalProps) {
  const { t } = useTranslation("openhands");
  const [activeTab, setActiveTab] = useState<LogTab>("stdout");

  const {
    data: outputs,
    isFetching,
    isResolvingConversation,
    sandboxIssue,
    conversationMissing,
    error,
  } = useBashCommandLogs({
    conversationId,
    bashCommandId,
    enabled: isOpen,
  });

  // Reset to the default tab whenever the modal opens for a different run.
  useEffect(() => {
    if (isOpen) setActiveTab("stdout");
  }, [isOpen, bashCommandId]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const { stdout, stderr } = useMemo(() => {
    if (!outputs) return { stdout: "", stderr: "" };
    return {
      stdout: concatStream(outputs, "stdout"),
      stderr: concatStream(outputs, "stderr"),
    };
  }, [outputs]);

  if (!isOpen) return null;

  const loading = isResolvingConversation || (isFetching && !outputs);
  const noBashCommand = !bashCommandId;
  const activeBody = activeTab === "stdout" ? stdout : stderr;
  const conversationHref = run
    ? run.conversation_id
      ? `/conversations/${run.conversation_id}`
      : null
    : conversationId
      ? `/conversations/${conversationId}`
      : null;
  const showDebug = run ? shouldShowRunDebugAction(run) : false;

  const tabBaseClass =
    "border-b-2 px-3 py-2 text-sm font-normal transition-colors focus:outline-none";
  const tabActiveClass = "border-[var(--oh-primary)] text-white";
  const tabInactiveClass = "border-transparent text-muted hover:text-content";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t(I18nKey.AUTOMATIONS$DETAIL$LOGS_TITLE)}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="presentation"
      />
      <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-[var(--oh-border)] bg-[var(--oh-surface)] p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-foreground"
          aria-label={t(I18nKey.AUTOMATIONS$CANCEL)}
        >
          <XMarkIcon className="size-5" />
        </button>

        {run ? (
          <RunInspectionSummary run={run} />
        ) : (
          <h2 className={cn("pr-8", modalTitleLgMediumClassName)}>
            {t(I18nKey.AUTOMATIONS$DETAIL$LOGS_TITLE)}
          </h2>
        )}

        <div
          role="tablist"
          aria-label={t(I18nKey.AUTOMATIONS$DETAIL$LOGS_TITLE)}
          className="mt-5 flex gap-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "stdout"}
            aria-controls="run-logs-panel-stdout"
            id="run-logs-tab-stdout"
            tabIndex={activeTab === "stdout" ? 0 : -1}
            onClick={() => setActiveTab("stdout")}
            className={`${tabBaseClass} ${
              activeTab === "stdout" ? tabActiveClass : tabInactiveClass
            }`}
          >
            {t(I18nKey.AUTOMATIONS$DETAIL$LOGS_TAB_OUTPUT)}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "stderr"}
            aria-controls="run-logs-panel-stderr"
            id="run-logs-tab-stderr"
            tabIndex={activeTab === "stderr" ? 0 : -1}
            onClick={() => setActiveTab("stderr")}
            className={`${tabBaseClass} ${
              activeTab === "stderr" ? tabActiveClass : tabInactiveClass
            }`}
          >
            {t(I18nKey.AUTOMATIONS$DETAIL$LOGS_TAB_ERROR)}
          </button>
        </div>

        <div
          role="tabpanel"
          id={`run-logs-panel-${activeTab}`}
          aria-labelledby={`run-logs-tab-${activeTab}`}
          className={cn(
            "mt-3 overflow-auto font-mono text-xs",
            noBashCommand
              ? "px-0 py-1"
              : "max-h-64 min-h-32 rounded-lg border border-[var(--oh-border)] bg-black/40 p-4",
          )}
        >
          {noBashCommand ? (
            <p className="text-muted">
              {t(I18nKey.AUTOMATIONS$DETAIL$LOGS_NO_COMMAND)}
            </p>
          ) : null}

          {!noBashCommand && conversationMissing ? (
            <p className="text-muted italic">
              {t(I18nKey.AUTOMATIONS$DETAIL$LOGS_CONVERSATION_MISSING)}
            </p>
          ) : null}

          {!noBashCommand && !conversationMissing && sandboxIssue ? (
            <p
              data-testid={`run-logs-sandbox-issue-${sandboxIssue}`}
              className="text-muted italic"
            >
              {t(SANDBOX_ISSUE_I18N[sandboxIssue])}
            </p>
          ) : null}

          {!noBashCommand &&
          !conversationMissing &&
          !sandboxIssue &&
          loading ? (
            <p className="text-muted italic">
              {t(I18nKey.AUTOMATIONS$DETAIL$LOGS_LOADING)}
            </p>
          ) : null}

          {!noBashCommand &&
          !conversationMissing &&
          !sandboxIssue &&
          !loading &&
          error &&
          !outputs ? (
            <p className="text-danger">
              {t(I18nKey.AUTOMATIONS$DETAIL$LOGS_ERROR)}: {String(error)}
            </p>
          ) : null}

          {!loading && !sandboxIssue && outputs ? (
            <pre
              data-testid={`run-logs-output-${activeTab}`}
              className={`whitespace-pre-wrap break-words ${
                activeTab === "stderr" ? "text-danger" : "text-content"
              }`}
            >
              {activeBody.length > 0 ? (
                activeBody
              ) : (
                <span className="text-muted italic">
                  {t(I18nKey.AUTOMATIONS$DETAIL$LOGS_EMPTY)}
                </span>
              )}
            </pre>
          ) : null}
        </div>

        {conversationHref || showDebug ? (
          <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--oh-border)] pt-4">
            {conversationHref ? (
              <NavigationLink
                to={conversationHref}
                className="text-sm text-content transition-colors hover:text-foreground"
              >
                {t(I18nKey.AUTOMATIONS$DETAIL$OPEN_CONVERSATION)}
              </NavigationLink>
            ) : null}
            {showDebug && run ? (
              <DebugAutomationButton
                run={run}
                automation={automation}
                stderr={stderr}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
