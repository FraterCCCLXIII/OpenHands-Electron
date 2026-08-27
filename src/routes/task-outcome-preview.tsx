import { useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { ActivityLogItem } from "#/components/features/automations/detail/activity-log-item";
import { RunLogsModal } from "#/components/features/automations/detail/run-logs-modal";
import { AutomationCard } from "#/components/features/automations/automation-card";
import { AutomationListRow } from "#/components/features/automations/automation-list-row";
import { automationActivityListClassName } from "#/components/features/automations/automation-view-mode";
import { PinnedAutomationCard } from "#/components/features/home/featured-automations/pinned-automation-card";
import { HomeAutomationRunTooltip } from "#/components/features/home/featured-automations/home-automation-run-tooltip";
import {
  getDashboardSpec,
  hasAutomationInterface,
} from "#/manifests/automation-interface";
import { toRunSummaryState } from "#/components/features/automations/to-latest-run-state";
import type { LatestAutomationRunState } from "#/hooks/query/use-latest-automation-runs";
import type { Automation, AutomationRun } from "#/types/automation";
import {
  TASK_OUTCOME_PREVIEW_AUTOMATION,
  TASK_OUTCOME_PREVIEW_BLOCKED_RUN,
  TASK_OUTCOME_PREVIEW_CUSTOM_METADATA_RUN,
  TASK_OUTCOME_PREVIEW_FAILED_RUN,
  TASK_OUTCOME_PREVIEW_NEEDS_REVIEW_RUN,
  TASK_OUTCOME_PREVIEW_PARTIAL_RUN,
  TASK_OUTCOME_PREVIEW_RUNS,
  previewAutomationFor,
} from "#/components/features/automations/detail/task-outcome-preview-data";

export const clientLoader = () => {
  if (!hasAutomationInterface()) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }
  return null;
};

function previewRunState(latestRun: AutomationRun): LatestAutomationRunState {
  const older = TASK_OUTCOME_PREVIEW_RUNS.filter(
    (run) => run.id !== latestRun.id,
  )
    .slice()
    .reverse();
  return {
    latestRun,
    recentRuns: [latestRun, ...older],
    total: TASK_OUTCOME_PREVIEW_RUNS.length,
    isLoading: false,
    isError: false,
  };
}

function noop() {}

const PREVIEW_SECTION = {
  activityLog: "Activity Log",
  logsModal: "Logs modal",
  pinnedCard: "Home pinned card",
  dashboardCards: "Dashboard cards",
  listRow: "List row",
  hovercard: "Home hovercard",
} as const;

function PreviewSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      {}
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
        {heading}
      </h2>
      {children}
    </section>
  );
}

function CardPreview({
  automation,
  latestRun,
}: {
  automation: Automation;
  latestRun: AutomationRun;
}) {
  const insightsSpec = getDashboardSpec()?.insights;
  const runState = previewRunState(latestRun);
  const insights = insightsSpec
    ? { spec: insightsSpec, state: toRunSummaryState(runState) }
    : undefined;

  return (
    <AutomationCard
      automation={automation}
      onToggle={noop}
      onRunNow={noop}
      onDelete={noop}
      onExport={noop}
      insights={insights}
    />
  );
}

export default function TaskOutcomePreview() {
  const { t } = useTranslation("openhands");
  const [openLogs, setOpenLogs] = useState<"blocked" | "custom" | null>(null);
  const blockedState = previewRunState(TASK_OUTCOME_PREVIEW_BLOCKED_RUN);
  const insightsSpec = getDashboardSpec()?.insights;
  const listInsights = insightsSpec
    ? { spec: insightsSpec, state: toRunSummaryState(blockedState) }
    : undefined;
  const logsRun =
    openLogs === "blocked"
      ? TASK_OUTCOME_PREVIEW_BLOCKED_RUN
      : openLogs === "custom"
        ? TASK_OUTCOME_PREVIEW_CUSTOM_METADATA_RUN
        : null;

  return (
    <div className="min-h-full">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 p-6">
        <header className="flex flex-col gap-1">
          {/* eslint-disable-next-line i18next/no-literal-string -- design-only catalog heading */}
          <p className="text-xs uppercase tracking-wide text-muted">
            Design preview
          </p>
          {/* eslint-disable-next-line i18next/no-literal-string -- design-only catalog heading */}
          <h1 className="text-2xl font-semibold text-content">
            Task-outcome UI
          </h1>
          {/* eslint-disable-next-line i18next/no-literal-string -- design-only catalog heading */}
          <p className="text-sm text-muted">
            Real components with mock HubSpot runs. Open the Logs buttons to
            inspect Run / Task / System.
          </p>
        </header>

        <PreviewSection heading={PREVIEW_SECTION.activityLog}>
          <div
            data-testid="task-outcome-preview-activity-log"
            className="rounded-2xl border border-[var(--oh-border)] bg-[var(--oh-surface)]"
          >
            <div className="border-b border-[var(--oh-border)] px-5 py-3">
              <h3 className="text-sm font-medium text-content">
                {t(I18nKey.AUTOMATIONS$DETAIL$ACTIVITY_LOG)}
              </h3>
            </div>
            {TASK_OUTCOME_PREVIEW_RUNS.map((run, index) => (
              <div
                key={run.id}
                className={
                  index > 0 ? "border-t border-[var(--oh-border)]" : undefined
                }
              >
                <ActivityLogItem
                  run={run}
                  automation={TASK_OUTCOME_PREVIEW_AUTOMATION}
                />
              </div>
            ))}
          </div>
        </PreviewSection>

        <PreviewSection heading={PREVIEW_SECTION.logsModal}>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md border border-[var(--oh-border)] px-3 py-1.5 text-sm text-content hover:bg-surface-raised"
              onClick={() => setOpenLogs("blocked")}
            >
              {t(I18nKey.AUTOMATIONS$DETAIL$BLOCKED)}
            </button>
            <button
              type="button"
              className="rounded-md border border-[var(--oh-border)] px-3 py-1.5 text-sm text-content hover:bg-surface-raised"
              onClick={() => setOpenLogs("custom")}
            >
              {t(I18nKey.AUTOMATIONS$DETAIL$CUSTOM_TASK_METADATA)}
            </button>
          </div>
        </PreviewSection>

        <PreviewSection heading={PREVIEW_SECTION.pinnedCard}>
          <div className="max-w-md">
            <PinnedAutomationCard
              automation={TASK_OUTCOME_PREVIEW_AUTOMATION}
              runState={blockedState}
              onUnpin={noop}
              onDragStart={noop}
              onDragOver={noop}
              onDrop={noop}
              onDragEnd={noop}
              isDropTarget={false}
              dropPosition={null}
              isDragging={false}
            />
          </div>
        </PreviewSection>

        <PreviewSection heading={PREVIEW_SECTION.dashboardCards}>
          <div className="grid gap-4 md:grid-cols-2">
            <CardPreview
              automation={previewAutomationFor(
                "preview-card-blocked",
                TASK_OUTCOME_PREVIEW_AUTOMATION.name,
              )}
              latestRun={TASK_OUTCOME_PREVIEW_BLOCKED_RUN}
            />
            <CardPreview
              automation={previewAutomationFor(
                "preview-card-failed",
                "Feed writer",
              )}
              latestRun={TASK_OUTCOME_PREVIEW_FAILED_RUN}
            />
            <CardPreview
              automation={previewAutomationFor(
                "preview-card-partial",
                "Digest poster",
              )}
              latestRun={TASK_OUTCOME_PREVIEW_PARTIAL_RUN}
            />
            <CardPreview
              automation={previewAutomationFor(
                "preview-card-review",
                "Contact picker",
              )}
              latestRun={TASK_OUTCOME_PREVIEW_NEEDS_REVIEW_RUN}
            />
          </div>
        </PreviewSection>

        <PreviewSection heading={PREVIEW_SECTION.listRow}>
          <ul className={automationActivityListClassName}>
            <AutomationListRow
              automation={TASK_OUTCOME_PREVIEW_AUTOMATION}
              onToggle={noop}
              onRunNow={noop}
              onDelete={noop}
              onExport={noop}
              insights={listInsights}
            />
          </ul>
        </PreviewSection>

        <PreviewSection heading={PREVIEW_SECTION.hovercard}>
          <div className="w-[280px] rounded-xl border border-[var(--oh-border)] bg-base-secondary">
            <HomeAutomationRunTooltip
              automation={TASK_OUTCOME_PREVIEW_AUTOMATION}
              runState={blockedState}
            />
          </div>
        </PreviewSection>
      </div>

      <RunLogsModal
        isOpen={logsRun !== null}
        conversationId={logsRun?.conversation_id ?? null}
        bashCommandId={null}
        onClose={() => setOpenLogs(null)}
        run={logsRun ?? undefined}
        automation={TASK_OUTCOME_PREVIEW_AUTOMATION}
      />
    </div>
  );
}
