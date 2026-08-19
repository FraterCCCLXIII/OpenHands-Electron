import { useMemo, useState } from "react";
import {
  groupWorkflowAutomationsByStage,
  MOCK_WORKFLOW_STAGE_AUTOMATIONS,
  type WorkflowStageAutomation,
} from "#/fixtures/workflows-automations-mock";
import {
  groupWorkflowRecommendedAutomationsByStage,
  MOCK_WORKFLOW_RECOMMENDED_AUTOMATIONS,
  type WorkflowRecommendedAutomation,
} from "#/fixtures/workflows-recommended-mock";
import {
  WORKFLOW_SDLC_STAGES,
  type WorkflowSdlcStage,
  type WorkflowSourceKind,
} from "#/types/workflow";
import { WorkflowKanbanColumn } from "./workflow-kanban-column";

const DEFAULT_COLUMN_SOURCES: WorkflowSourceKind[] = ["github"];

function createDefaultColumnSources(): Record<
  WorkflowSdlcStage,
  WorkflowSourceKind[]
> {
  return Object.fromEntries(
    WORKFLOW_SDLC_STAGES.map((stage) => [stage, [...DEFAULT_COLUMN_SOURCES]]),
  ) as Record<WorkflowSdlcStage, WorkflowSourceKind[]>;
}

export function WorkflowsKanbanBoard() {
  const [columnSources, setColumnSources] = useState(
    createDefaultColumnSources,
  );
  const [automations, setAutomations] = useState<WorkflowStageAutomation[]>(
    () => [...MOCK_WORKFLOW_STAGE_AUTOMATIONS],
  );
  const [draggedAutomationId, setDraggedAutomationId] = useState<string | null>(
    null,
  );
  const [dropTargetStage, setDropTargetStage] =
    useState<WorkflowSdlcStage | null>(null);

  const automationsByStage = useMemo(
    () => groupWorkflowAutomationsByStage(automations),
    [automations],
  );

  const activeAutomationIds = useMemo(
    () => new Set(automations.map((automation) => automation.id)),
    [automations],
  );

  const recommendedByStage = useMemo(() => {
    const grouped = groupWorkflowRecommendedAutomationsByStage(
      MOCK_WORKFLOW_RECOMMENDED_AUTOMATIONS,
    );

    return Object.fromEntries(
      WORKFLOW_SDLC_STAGES.map((stage) => [
        stage,
        grouped[stage].filter(
          (recommendation) => !activeAutomationIds.has(recommendation.id),
        ),
      ]),
    ) as Record<WorkflowSdlcStage, WorkflowRecommendedAutomation[]>;
  }, [activeAutomationIds]);

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

  const moveAutomationToStage = (
    automationId: string,
    stage: WorkflowSdlcStage,
  ) => {
    setAutomations((current) =>
      current.map((automation) =>
        automation.id === automationId ? { ...automation, stage } : automation,
      ),
    );
  };

  const addRecommendedAutomation = (
    recommendation: WorkflowRecommendedAutomation,
  ) => {
    setAutomations((current) => {
      if (current.some((automation) => automation.id === recommendation.id)) {
        return current;
      }

      return [
        ...current,
        {
          id: recommendation.id,
          name: recommendation.name,
          description: recommendation.description,
          stage: recommendation.stage,
        },
      ];
    });
  };

  return (
    <div
      data-testid="workflows-kanban-board"
      className="flex h-full min-h-[420px] min-w-0 flex-1 gap-3 overflow-x-auto pb-2 custom-scrollbar-always"
    >
      {WORKFLOW_SDLC_STAGES.map((stage) => (
        <WorkflowKanbanColumn
          key={stage}
          stage={stage}
          automations={automationsByStage[stage]}
          recommendedAutomations={recommendedByStage[stage]}
          activeSources={columnSources[stage]}
          draggedAutomationId={draggedAutomationId}
          isDropTarget={dropTargetStage === stage}
          onAddSource={(source) => addColumnSource(stage, source)}
          onRemoveSource={(source) => removeColumnSource(stage, source)}
          onAddRecommendedAutomation={addRecommendedAutomation}
          onAutomationDragStart={setDraggedAutomationId}
          onAutomationDragEnd={() => {
            setDraggedAutomationId(null);
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
            if (draggedAutomationId) {
              moveAutomationToStage(draggedAutomationId, stage);
            }
            setDraggedAutomationId(null);
            setDropTargetStage(null);
          }}
        />
      ))}
    </div>
  );
}
