import type { WorkflowSdlcStage } from "#/types/workflow";

export interface WorkflowStageAutomation {
  id: string;
  name: string;
  description?: string;
  stage: WorkflowSdlcStage;
}

/** Static mock automations associated with SDLC workflow stages. */
export const MOCK_WORKFLOW_STAGE_AUTOMATIONS: WorkflowStageAutomation[] = [
  {
    id: "wf-auto-req-1",
    name: "Triage incoming issues",
    description: "Label, assign, and route new tickets into the backlog.",
    stage: "requirements",
  },
  {
    id: "wf-auto-req-2",
    name: "Spec review reminder",
    description: "Ping owners when acceptance criteria sit idle for 48 hours.",
    stage: "requirements",
  },
  {
    id: "wf-auto-des-1",
    name: "Design doc checklist",
    description: "Verify diagrams, API notes, and rollout plan before build.",
    stage: "design",
  },
  {
    id: "wf-auto-imp-1",
    name: "Open draft PR on branch push",
    description:
      "Create a linked pull request when an implementation branch updates.",
    stage: "implementation",
  },
  {
    id: "wf-auto-imp-2",
    name: "Request code review",
    description: "Assign reviewers and post the review checklist in Slack.",
    stage: "implementation",
  },
  {
    id: "wf-auto-ver-1",
    name: "Run CI smoke suite",
    description: "Execute the fast verification workflow on every ready PR.",
    stage: "verification",
  },
  {
    id: "wf-auto-rel-1",
    name: "Publish release notes",
    description:
      "Draft changelog entries from merged work in the release column.",
    stage: "release",
  },
  {
    id: "wf-auto-rel-2",
    name: "Notify stakeholders on deploy",
    description: "Post deployment status to product and support channels.",
    stage: "release",
  },
];

export function groupWorkflowAutomationsByStage(
  automations: WorkflowStageAutomation[],
): Record<WorkflowSdlcStage, WorkflowStageAutomation[]> {
  const grouped: Record<WorkflowSdlcStage, WorkflowStageAutomation[]> = {
    requirements: [],
    design: [],
    implementation: [],
    verification: [],
    release: [],
  };

  for (const automation of automations) {
    grouped[automation.stage].push(automation);
  }

  return grouped;
}
