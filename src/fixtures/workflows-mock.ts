import type {
  WorkflowItem,
  WorkflowSourceKind,
  WorkflowSdlcStage,
} from "#/types/workflow";

/** Static mock data for the Workflows kanban mockup. */
export const MOCK_WORKFLOW_ITEMS: WorkflowItem[] = [
  {
    id: "wf-1",
    title: "OAuth device flow for Cloud login",
    description: "Define acceptance criteria and security constraints.",
    stage: "requirements",
    source: "github",
    assignee: "Alex",
    automationId: "wf-auto-req-1",
  },
  {
    id: "wf-2",
    title: "Automations dashboard filters",
    description: "Status, trigger, and sort controls for large lists.",
    stage: "requirements",
    source: "linear",
    assignee: "Jordan",
    automationId: "wf-auto-req-2",
  },
  {
    id: "wf-3",
    title: "Workflows kanban shell",
    description: "Column layout, card chrome, and drag targets.",
    stage: "design",
    source: "jira",
    assignee: "Sam",
    automationId: "wf-auto-des-1",
  },
  {
    id: "wf-4",
    title: "Pinned automation cards",
    description: "Sparkline metrics and conversation links on home.",
    stage: "implementation",
    source: "github",
    assignee: "Riley",
    automationId: "wf-auto-imp-1",
  },
  {
    id: "wf-5",
    title: "MCP marketplace install modal",
    description: "Credential fields and server test handshake.",
    stage: "implementation",
    source: "linear",
    assignee: "Casey",
  },
  {
    id: "wf-6",
    title: "Plugin card layout refresh",
    description: "Align badges and source labels with skill cards.",
    stage: "verification",
    source: "jira",
    assignee: "Morgan",
    automationId: "wf-auto-ver-1",
  },
  {
    id: "wf-7",
    title: "Live E2E smoke on PR label",
    description: "Gate expensive runs behind trusted PR workflows.",
    stage: "release",
    source: "github",
    assignee: "Taylor",
    automationId: "wf-auto-rel-1",
  },
];

export function groupWorkflowItemsByStage(
  items: WorkflowItem[],
): Record<WorkflowSdlcStage, WorkflowItem[]> {
  const grouped: Record<WorkflowSdlcStage, WorkflowItem[]> = {
    requirements: [],
    design: [],
    implementation: [],
    verification: [],
    release: [],
  };

  for (const item of items) {
    grouped[item.stage].push(item);
  }

  return grouped;
}

export function filterWorkflowItemsForColumn(
  items: WorkflowItem[],
  activeSources: WorkflowSourceKind[],
): WorkflowItem[] {
  if (activeSources.length === 0) {
    return [];
  }

  return items.filter((item) => activeSources.includes(item.source));
}
