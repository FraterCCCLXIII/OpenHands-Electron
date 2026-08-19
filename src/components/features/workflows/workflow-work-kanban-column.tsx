import type { DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import type {
  WorkflowItem,
  WorkflowSdlcStage,
  WorkflowSourceKind,
} from "#/types/workflow";
import { WORKFLOW_STAGE_LABEL_KEYS } from "#/utils/workflow-stage-labels";
import { cn } from "#/utils/utils";
import { WorkflowColumnSources } from "./workflow-column-sources";
import { WorkflowWorkCard } from "./workflow-work-card";

interface WorkflowWorkKanbanColumnProps {
  stage: WorkflowSdlcStage;
  workItems: WorkflowItem[];
  automationNamesById: ReadonlyMap<string, string>;
  activeSources: WorkflowSourceKind[];
  draggedWorkItemId: string | null;
  isDropTarget: boolean;
  onAddSource: (source: WorkflowSourceKind) => void;
  onRemoveSource: (source: WorkflowSourceKind) => void;
  onWorkItemDragStart: (itemId: string) => void;
  onWorkItemDragEnd: () => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
}

export function WorkflowWorkKanbanColumn({
  stage,
  workItems,
  automationNamesById,
  activeSources,
  draggedWorkItemId,
  isDropTarget,
  onAddSource,
  onRemoveSource,
  onWorkItemDragStart,
  onWorkItemDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: WorkflowWorkKanbanColumnProps) {
  const { t } = useTranslation("openhands");

  return (
    <section
      data-testid={`workflow-work-column-${stage}`}
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
            data-testid={`workflow-work-column-count-${stage}`}
            className="inline-flex min-w-6 items-center justify-center rounded-full border border-[var(--oh-border)] px-2 py-0.5 text-[11px] text-tertiary-alt"
          >
            {workItems.length}
          </span>
        </div>
        <WorkflowColumnSources
          stage={stage}
          activeSources={activeSources}
          onAddSource={onAddSource}
          onRemoveSource={onRemoveSource}
        />
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2 custom-scrollbar-always">
        {workItems.length === 0 ? (
          <p
            data-testid={`workflow-work-column-empty-${stage}`}
            className="px-1 py-4 text-center text-xs text-muted"
          >
            {activeSources.length === 0
              ? t(I18nKey.WORKFLOWS$COLUMN_NO_SOURCES)
              : t(I18nKey.WORKFLOWS$COLUMN_NO_WORK)}
          </p>
        ) : (
          workItems.map((item) => (
            <WorkflowWorkCard
              key={item.id}
              item={item}
              automationName={
                item.automationId
                  ? automationNamesById.get(item.automationId)
                  : undefined
              }
              isDragging={draggedWorkItemId === item.id}
              onDragStart={onWorkItemDragStart}
              onDragEnd={onWorkItemDragEnd}
            />
          ))
        )}
      </div>
    </section>
  );
}
