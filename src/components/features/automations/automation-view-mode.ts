export type AutomationListViewMode = "grid" | "list";

export const AUTOMATIONS_VIEW_MODE_STORAGE_KEY = "openhands-automations-view";

export function readStoredAutomationViewMode(): AutomationListViewMode {
  if (typeof window === "undefined") {
    return "grid";
  }

  const stored = window.localStorage.getItem(AUTOMATIONS_VIEW_MODE_STORAGE_KEY);
  if (stored === "list") return "list";
  return "grid";
}

export function writeStoredAutomationViewMode(
  view: AutomationListViewMode,
): void {
  window.localStorage.setItem(AUTOMATIONS_VIEW_MODE_STORAGE_KEY, view);
}

export {
  tableContainerClassName as automationListTableClassName,
  tableRowInteractiveClassName as automationListRowClassName,
  tableCellClassName as automationListCellClassName,
} from "#/utils/table-row-classes";
