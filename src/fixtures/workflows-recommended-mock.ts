import type { WorkflowSdlcStage } from "#/types/workflow";

export interface WorkflowRecommendedAutomation {
  id: string;
  name: string;
  description?: string;
  stage: WorkflowSdlcStage;
}

/** Suggested automations a user can add to each SDLC workflow step. */
export const MOCK_WORKFLOW_RECOMMENDED_AUTOMATIONS: WorkflowRecommendedAutomation[] =
  [
    {
      id: "wf-rec-req-1",
      name: "Backlog groomer",
      description: "Close stale tickets and rebalance priority labels.",
      stage: "requirements",
    },
    {
      id: "wf-rec-req-2",
      name: "Stakeholder digest",
      description: "Summarize new requirements for product review.",
      stage: "requirements",
    },
    {
      id: "wf-rec-des-1",
      name: "Design review ping",
      description: "Request sign-off when a RFC is ready.",
      stage: "design",
    },
    {
      id: "wf-rec-des-2",
      name: "Figma link checker",
      description: "Verify design artifacts are linked on issues.",
      stage: "design",
    },
    {
      id: "wf-rec-imp-1",
      name: "Branch naming guard",
      description: "Reject pushes that skip team branch conventions.",
      stage: "implementation",
    },
    {
      id: "wf-rec-imp-2",
      name: "Draft PR reminder",
      description: "Nudge authors to mark PRs ready for review.",
      stage: "implementation",
    },
    {
      id: "wf-rec-ver-1",
      name: "Flaky test notifier",
      description: "Flag tests that fail intermittently on main.",
      stage: "verification",
    },
    {
      id: "wf-rec-ver-2",
      name: "QA sign-off reminder",
      description: "Ping QA when verification builds are green.",
      stage: "verification",
    },
    {
      id: "wf-rec-rel-1",
      name: "Deployment checklist",
      description: "Walk through release gates before production.",
      stage: "release",
    },
    {
      id: "wf-rec-rel-2",
      name: "Rollback watcher",
      description: "Monitor error rates after a deploy finishes.",
      stage: "release",
    },
  ];

export function groupWorkflowRecommendedAutomationsByStage(
  automations: WorkflowRecommendedAutomation[],
): Record<WorkflowSdlcStage, WorkflowRecommendedAutomation[]> {
  const grouped: Record<WorkflowSdlcStage, WorkflowRecommendedAutomation[]> = {
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
