import type { Automation } from "#/types/automation";

export const ACTIVITY_LOG_STATES_PREVIEW_QUERY_PARAM =
  "previewActivityLogStates";

/** Reserved detail-page id so the catalog can live on the real automation page. */
export const ACTIVITY_LOG_STATES_PREVIEW_AUTOMATION_ID = "preview-activity-log";

/**
 * Flip off after the design pass. While true, /automations/preview-activity-log
 * shows the catalog in the real Activity Log.
 */
export const FORCE_ACTIVITY_LOG_STATES_PREVIEW = true;

export function isActivityLogStatesPreviewActive(
  search = typeof window !== "undefined" ? window.location.search : "",
): boolean {
  return new URLSearchParams(search).has(
    ACTIVITY_LOG_STATES_PREVIEW_QUERY_PARAM,
  );
}

export function isActivityLogStatesPreviewAutomation(
  automationId: string | undefined,
): boolean {
  return (
    FORCE_ACTIVITY_LOG_STATES_PREVIEW &&
    automationId === ACTIVITY_LOG_STATES_PREVIEW_AUTOMATION_ID
  );
}

/** Mock detail-page automation so the catalog can sit in the real layout. */
export const ACTIVITY_LOG_STATES_PREVIEW_AUTOMATION: Automation = {
  id: ACTIVITY_LOG_STATES_PREVIEW_AUTOMATION_ID,
  name: "HubSpot contact digest",
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
  updated_at: "2026-08-19T19:00:00.000Z",
  last_triggered_at: "2026-08-19T19:36:00.000Z",
  prompt:
    "Search HubSpot for new contacts from the last week and post a short digest.",
};
