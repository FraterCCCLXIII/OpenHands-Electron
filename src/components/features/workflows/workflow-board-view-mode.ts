export type WorkflowBoardViewMode = "automations" | "work";

export const WORKFLOW_BOARD_VIEW_MODE_STORAGE_KEY =
  "openhands-workflows-board-view";

export function readStoredWorkflowBoardViewMode(): WorkflowBoardViewMode {
  if (typeof window === "undefined") {
    return "automations";
  }

  const stored = window.localStorage.getItem(
    WORKFLOW_BOARD_VIEW_MODE_STORAGE_KEY,
  );
  if (stored === "work") return "work";
  return "automations";
}

export function writeStoredWorkflowBoardViewMode(
  view: WorkflowBoardViewMode,
): void {
  window.localStorage.setItem(WORKFLOW_BOARD_VIEW_MODE_STORAGE_KEY, view);
}
