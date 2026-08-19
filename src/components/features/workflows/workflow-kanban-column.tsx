import type { DragEvent } from "react";
import { useTranslation } from "react-i18next";
import type { WorkflowRecommendedAutomation } from "#/fixtures/workflows-recommended-mock";
import type { WorkflowStageAutomation } from "#/fixtures/workflows-automations-mock";
import { I18nKey } from "#/i18n/declaration";
import type { WorkflowSdlcStage, WorkflowSourceKind } from "#/types/workflow";
import { WORKFLOW_STAGE_LABEL_KEYS } from "#/utils/workflow-stage-labels";
import { cn } from "#/utils/utils";
import { WorkflowAutomationCard } from "./workflow-automation-card";
import { WorkflowColumnAutomations } from "./workflow-column-automations";
import { WorkflowColumnRecommendedAutomations } from "./workflow-column-recommended-automations";
import { WorkflowColumnSources } from "./workflow-column-sources";

interface WorkflowKanbanColumnProps {
  stage: WorkflowSdlcStage;
  automations: WorkflowStageAutomation[];
  recommendedAutomations: WorkflowRecommendedAutomation[];
  activeSources: WorkflowSourceKind[];
  draggedAutomationId: string | null;
  isDropTarget: boolean;
  onAddSource: (source: WorkflowSourceKind) => void;
  onRemoveSource: (source: WorkflowSourceKind) => void;
  onAddRecommendedAutomation: (
    recommendation: WorkflowRecommendedAutomation,
  ) => void;
  onAutomationDragStart: (automationId: string) => void;
  onAutomationDragEnd: () => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
}

export function WorkflowKanbanColumn({
  stage,
  automations,
  recommendedAutomations,
  activeSources,
  draggedAutomationId,
  isDropTarget,
  onAddSource,
  onRemoveSource,
  onAddRecommendedAutomation,
  onAutomationDragStart,
  onAutomationDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: WorkflowKanbanColumnProps) {
  const { t } = useTranslation("openhands");

  return (
    <section
      data-testid={`workflow-column-${stage}`}
      aria-label={t(WORKFLOW_STAGE_LABEL_KEYS[stage])}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className={cn(
        "flex h-full min-h-[420px] min-w-[240px] flex-1 flex-col rounded-xl border border-[var(--oh-border)] bg-base-secondary/60",
        isDropTarget &&
          "border-[var(--oh-interactive-hover)] bg-surface-raised/40",
      )}
    >
      <header className="flex flex-col gap-2 border-b border-[var(--oh-border)] px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-content">
            {t(WORKFLOW_STAGE_LABEL_KEYS[stage])}
          </h2>
          <span
            data-testid={`workflow-column-count-${stage}`}
            className="inline-flex min-w-6 items-center justify-center rounded-full border border-[var(--oh-border)] px-2 py-0.5 text-[11px] text-tertiary-alt"
          >
            {automations.length}
          </span>
        </div>
        <WorkflowColumnSources
          stage={stage}
          activeSources={activeSources}
          onAddSource={onAddSource}
          onRemoveSource={onRemoveSource}
        />
        <div data-testid={`workflow-column-automations-${stage}`}>
          <WorkflowColumnAutomations stage={stage} />
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 custom-scrollbar-always">
          {automations.length === 0 ? (
            <p
              data-testid={`workflow-column-no-automations-${stage}`}
              className="px-1 py-4 text-center text-xs text-muted"
            >
              {t(I18nKey.WORKFLOWS$COLUMN_NO_AUTOMATIONS)}
            </p>
          ) : (
            automations.map((automation) => (
              <WorkflowAutomationCard
                key={automation.id}
                automation={automation}
                isDragging={draggedAutomationId === automation.id}
                onDragStart={onAutomationDragStart}
                onDragEnd={onAutomationDragEnd}
              />
            ))
          )}
        </div>
        <WorkflowColumnRecommendedAutomations
          stage={stage}
          recommendations={recommendedAutomations}
          onAddRecommendation={onAddRecommendedAutomation}
        />
      </div>
    </section>
  );
}
