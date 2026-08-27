import {
  AutomationRunStatus,
  type Automation,
  type AutomationRun,
} from "#/types/automation";

export const TASK_OUTCOME_PREVIEW_AUTOMATION_ID = "preview-task-outcomes";

export const TASK_OUTCOME_PREVIEW_AUTOMATION: Automation = {
  id: TASK_OUTCOME_PREVIEW_AUTOMATION_ID,
  name: "CRM enrichment digest",
  trigger: {
    type: "cron",
    schedule: "0 19 * * 3",
    schedule_human: "Every Wednesday at 7:00 PM",
    timezone: "America/Los_Angeles",
  },
  enabled: true,
  model: "openhands/minimax-m2.7",
  timeout: 600,
  created_at: "2026-08-01T19:00:00.000Z",
  updated_at: "2026-08-19T19:36:00.000Z",
  last_triggered_at: "2026-08-19T19:36:00.000Z",
  prompt:
    "Search HubSpot, enrich matching contacts, and post a concise digest with any blockers.",
};

function makeRun(
  id: string,
  startedAt: string,
  overrides: Partial<AutomationRun> = {},
): AutomationRun {
  return {
    id,
    status: AutomationRunStatus.COMPLETED,
    conversation_id: null,
    bash_command_id: `${id}-cmd`,
    error_detail: null,
    started_at: startedAt,
    completed_at: startedAt,
    ...overrides,
  };
}

export const TASK_OUTCOME_PREVIEW_RUNS: AutomationRun[] = [
  makeRun("preview-pending", "2026-08-19T19:00:00.000Z", {
    status: AutomationRunStatus.PENDING,
    bash_command_id: null,
    completed_at: null,
  }),
  makeRun("preview-running", "2026-08-19T19:02:00.000Z", {
    status: AutomationRunStatus.RUNNING,
    completed_at: null,
    phase_code: "fetching_contacts",
    phase_label: "Fetching contacts",
    phase_updated_at: "2026-08-19T19:02:00.000Z",
  }),
  makeRun("preview-completed-plain", "2026-08-19T19:04:00.000Z", {
    cost: 0.0412,
  }),
  makeRun("preview-success", "2026-08-19T19:12:00.000Z", {
    cost: 0.1357,
    run_metadata: {
      finish_tool_response: {
        status: "success",
        outcome_summary: "Printed hello world successfully.",
      },
    },
  }),
  makeRun("preview-blocked", "2026-08-19T19:24:00.000Z", {
    cost: 0.2885,
    error_detail: "Environment variable HUBSPOT_API_KEY is missing.",
    status_detail: {
      phase: "callback",
      kind: "execution_error",
      detail: "Environment variable HUBSPOT_API_KEY is missing.",
      source: "environment",
    },
    run_metadata: {
      finish_tool_response: {
        status: "blocked",
        outcome_summary:
          "Attempted HubSpot CRM contact search but HUBSPOT_API_KEY was unavailable.",
      },
    },
  }),
  makeRun("preview-task-failed", "2026-08-19T19:26:00.000Z", {
    cost: 0.192,
    run_metadata: {
      finish_tool_response: {
        status: "failed",
        outcome_summary:
          "Could not write the digest. The feed returned 403 and retries were exhausted.",
      },
    },
  }),
  makeRun("preview-partial", "2026-08-19T19:28:00.000Z", {
    cost: 0.2104,
    run_metadata: {
      finish_tool_response: {
        status: "partial_success",
        outcome_summary:
          "Posted 4 of 6 items. Two feeds timed out; skipped those sources and continued.",
      },
    },
  }),
  makeRun("preview-unknown", "2026-08-19T19:30:00.000Z", {
    cost: 0.0881,
    run_metadata: {
      finish_tool_response: {
        status: "unknown",
        outcome_summary:
          "Finished the run but could not assess whether the task succeeded.",
      },
    },
  }),
  makeRun("preview-custom-metadata", "2026-08-19T19:31:00.000Z", {
    cost: 0.0644,
    run_metadata: {
      finish_tool_response: {
        crm_contacts_checked: 12,
        matches: ["Acme", "Globex"],
        next_action: "Ask user to pick a contact.",
      },
    },
  }),
  makeRun("preview-system-failed", "2026-08-19T19:32:00.000Z", {
    status: AutomationRunStatus.FAILED,
    conversation_id: null,
    cost: 0.02,
    error_detail: "The run stopped before the task finished.",
    status_detail: {
      phase: "sandbox",
      kind: "timeout",
      detail: "Sandbox timed out before the agent could finish.",
    },
  }),
  makeRun("preview-cancelled", "2026-08-19T19:34:00.000Z", {
    status: AutomationRunStatus.CANCELLED,
    conversation_id: null,
    bash_command_id: null,
    completed_at: "2026-08-19T19:34:00.000Z",
  }),
  makeRun("preview-skipped", "2026-08-19T19:36:00.000Z", {
    status: AutomationRunStatus.SKIPPED,
    conversation_id: null,
    bash_command_id: null,
    completed_at: "2026-08-19T19:36:00.000Z",
  }),
];

export const TASK_OUTCOME_PREVIEW_BLOCKED_RUN = TASK_OUTCOME_PREVIEW_RUNS.find(
  (run) => run.id === "preview-blocked",
)!;
export const TASK_OUTCOME_PREVIEW_CUSTOM_METADATA_RUN =
  TASK_OUTCOME_PREVIEW_RUNS.find(
    (run) => run.id === "preview-custom-metadata",
  )!;
export const TASK_OUTCOME_PREVIEW_FAILED_RUN = TASK_OUTCOME_PREVIEW_RUNS.find(
  (run) => run.id === "preview-task-failed",
)!;
export const TASK_OUTCOME_PREVIEW_PARTIAL_RUN = TASK_OUTCOME_PREVIEW_RUNS.find(
  (run) => run.id === "preview-partial",
)!;
export const TASK_OUTCOME_PREVIEW_NEEDS_REVIEW_RUN =
  TASK_OUTCOME_PREVIEW_RUNS.find((run) => run.id === "preview-unknown")!;

export function previewAutomationFor(id: string, name: string): Automation {
  return {
    ...TASK_OUTCOME_PREVIEW_AUTOMATION,
    id,
    name,
  };
}
