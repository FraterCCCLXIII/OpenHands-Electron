/** Issue trackers and repos that can feed the workflows board. */
export const WORKFLOW_SOURCE_KINDS = ["github", "linear", "jira"] as const;

export type WorkflowSourceKind = (typeof WORKFLOW_SOURCE_KINDS)[number];

/** Canonical SDLC stages shown as kanban columns. */
export const WORKFLOW_SDLC_STAGES = [
  "requirements",
  "design",
  "implementation",
  "verification",
  "release",
] as const;

export type WorkflowSdlcStage = (typeof WORKFLOW_SDLC_STAGES)[number];

export interface WorkflowItem {
  id: string;
  title: string;
  description: string;
  stage: WorkflowSdlcStage;
  source: WorkflowSourceKind;
  assignee?: string;
  /** When set, a stage automation acts on this workflow item. */
  automationId?: string;
}
