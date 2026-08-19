import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAutomationSubPageNav } from "#/components/features/automations/dashboard/use-automation-sub-page-nav";
import { ManifestSubpageLayout } from "#/components/features/manifest/manifest-subpage-layout";
import {
  readStoredWorkflowBoardViewMode,
  writeStoredWorkflowBoardViewMode,
  type WorkflowBoardViewMode,
} from "#/components/features/workflows/workflow-board-view-mode";
import { WorkflowBoardViewToggle } from "#/components/features/workflows/workflow-board-view-toggle";
import { WorkflowsKanbanBoard } from "#/components/features/workflows/workflows-kanban-board";
import { WorkflowsWorkKanbanBoard } from "#/components/features/workflows/workflows-work-kanban-board";
import { I18nKey } from "#/i18n/declaration";
import { hasAutomationInterface } from "#/manifests/automation-interface";

/**
 * The SDLC workflows board as its own Automate sub-page, alongside the
 * dashboard and templates tabs rather than replacing them.
 */
export const clientLoader = () => {
  if (!hasAutomationInterface()) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }
  return null;
};

export default function AutomationWorkflows() {
  const { t } = useTranslation("openhands");
  const nav = useAutomationSubPageNav();
  const [boardView, setBoardView] = useState<WorkflowBoardViewMode>(() =>
    readStoredWorkflowBoardViewMode(),
  );

  const handleBoardViewChange = useCallback((view: WorkflowBoardViewMode) => {
    setBoardView(view);
    writeStoredWorkflowBoardViewMode(view);
  }, []);

  if (!nav) return null;

  return (
    <ManifestSubpageLayout
      heading={nav.heading}
      navTestIdBase="automations-navbar"
      items={nav.items}
      contentClassName="max-w-[1400px] min-h-full"
    >
      <div className="shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-content">
              {t(I18nKey.WORKFLOWS$TITLE)}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {t(I18nKey.WORKFLOWS$DESCRIPTION)}
            </p>
          </div>
          <WorkflowBoardViewToggle
            view={boardView}
            onChange={handleBoardViewChange}
          />
        </div>
      </div>
      <div className="mt-auto flex min-h-0 flex-1 flex-col">
        {boardView === "work" ? (
          <WorkflowsWorkKanbanBoard />
        ) : (
          <WorkflowsKanbanBoard />
        )}
      </div>
    </ManifestSubpageLayout>
  );
}
