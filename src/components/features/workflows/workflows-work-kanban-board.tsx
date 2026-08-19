import { useMemo, useState } from "react";
import {
  filterWorkflowItemsForColumn,
  groupWorkflowItemsByStage,
  MOCK_WORKFLOW_ITEMS,
} from "#/fixtures/workflows-mock";
import { MOCK_WORKFLOW_STAGE_AUTOMATIONS } from "#/fixtures/workflows-automations-mock";
import {
  WORKFLOW_SDLC_STAGES,
  type WorkflowItem,
  type WorkflowSdlcStage,
  type WorkflowSourceKind,
} from "#/types/workflow";
import { WorkflowWorkKanbanColumn } from "./workflow-work-kanban-column";

const DEFAULT_COLUMN_SOURCES: WorkflowSourceKind[] = ["github"];

function createDefaultColumnSources(): Record<
  WorkflowSdlcStage,
  WorkflowSourceKind[]
> {
  return Object.fromEntries(
    WORKFLOW_SDLC_STAGES.map((stage) => [stage, [...DEFAULT_COLUMN_SOURCES]]),
  ) as Record<WorkflowSdlcStage, WorkflowSourceKind[]>;
}

export function WorkflowsWorkKanbanBoard() {
  const [columnSources, setColumnSources] = useState(
    createDefaultColumnSources,
  );
  const [workItems, setWorkItems] = useState<WorkflowItem[]>(() => [
    ...MOCK_WORKFLOW_ITEMS,
  ]);
  const [draggedWorkItemId, setDraggedWorkItemId] = useState<string | null>(
    null,
  );
  const [dropTargetStage, setDropTargetStage] =
    useState<WorkflowSdlcStage | null>(null);

  const automationNamesById = useMemo(
    () =>
      new Map(
        MOCK_WORKFLOW_STAGE_AUTOMATIONS.map((automation) => [
          automation.id,
          automation.name,
        ]),
      ),
    [],
  );

  const workItemsByStage = useMemo(
    () => groupWorkflowItemsByStage(workItems),
    [workItems],
  );

  const addColumnSource = (
    stage: WorkflowSdlcStage,
    source: WorkflowSourceKind,
  ) => {
    setColumnSources((current) => {
      const activeSources = current[stage];
      if (activeSources.includes(source)) {
        return current;
      }

      return {
        ...current,
        [stage]: [...activeSources, source],
      };
    });
  };

  const removeColumnSource = (
    stage: WorkflowSdlcStage,
    source: WorkflowSourceKind,
  ) => {
    setColumnSources((current) => ({
      ...current,
      [stage]: current[stage].filter((entry) => entry !== source),
    }));
  };

  const moveWorkItemToStage = (itemId: string, stage: WorkflowSdlcStage) => {
    setWorkItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, stage } : item)),
    );
  };

  return (
    <div
      data-testid="workflows-work-kanban-board"
      className="flex h-full min-h-[420px] min-w-0 flex-1 gap-3 overflow-x-auto pb-2 custom-scrollbar-always"
    >
      {WORKFLOW_SDLC_STAGES.map((stage) => (
        <WorkflowWorkKanbanColumn
          key={stage}
          stage={stage}
          workItems={filterWorkflowItemsForColumn(
            workItemsByStage[stage],
            columnSources[stage],
          )}
          automationNamesById={automationNamesById}
          activeSources={columnSources[stage]}
          draggedWorkItemId={draggedWorkItemId}
          isDropTarget={dropTargetStage === stage}
          onAddSource={(source) => addColumnSource(stage, source)}
          onRemoveSource={(source) => removeColumnSource(stage, source)}
          onWorkItemDragStart={setDraggedWorkItemId}
          onWorkItemDragEnd={() => {
            setDraggedWorkItemId(null);
            setDropTargetStage(null);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDropTargetStage(stage);
          }}
          onDragLeave={() => {
            setDropTargetStage((current) =>
              current === stage ? null : current,
            );
          }}
          onDrop={() => {
            if (draggedWorkItemId) {
              moveWorkItemToStage(draggedWorkItemId, stage);
            }
            setDraggedWorkItemId(null);
            setDropTargetStage(null);
          }}
        />
      ))}
    </div>
  );
}
