import type {
  Automation,
  AutomationSpec,
  AutomationTrigger,
} from "#/types/automation";
import {
  matchCatalogIntegrationIds,
  sanitizeCatalogIntegrationIds,
} from "#/utils/automation-required-integrations";

export const AUTOMATION_INTERVIEW_REPLY_PREFIX = "[automation-interview]";
export const AUTOMATION_DRAFT_FENCE = "automation-draft";
export const AUTOMATION_UI_FENCE = "automation-ui";
export const AUTOMATION_INTERVIEW_SEED_PREFIX =
  "Create an automation. Ask one question at a time";

export const AUTOMATION_INTERVIEW_FIELDS = [
  "intent",
  "triggerType",
  "schedule",
  "events",
  "name",
  "tokens",
  "review",
] as const;

export type AutomationInterviewField =
  (typeof AUTOMATION_INTERVIEW_FIELDS)[number];

export type AutomationTriggerType = "schedule" | "event";

export const AUTOMATION_SCHEDULE_PRESETS = [
  "15m",
  "hourly",
  "daily",
  "weekdays",
  "weekly",
  "custom",
] as const;

export type AutomationSchedulePreset =
  (typeof AUTOMATION_SCHEDULE_PRESETS)[number];

export const AUTOMATION_SCHEDULE_CRONS: Record<
  Exclude<AutomationSchedulePreset, "custom">,
  string
> = {
  "15m": "*/15 * * * *",
  hourly: "0 * * * *",
  daily: "0 9 * * *",
  weekdays: "30 8 * * 1-5",
  weekly: "0 16 * * 5",
};

export const AUTOMATION_EVENT_OPTIONS = [
  "pull_request.opened",
  "pull_request.updated",
  "pull_request.ready_for_review",
  "issues.opened",
  "push",
] as const;

export type AutomationEventOption = (typeof AUTOMATION_EVENT_OPTIONS)[number];

export const AUTOMATION_INTEGRATION_OPTIONS = [
  "github",
  "slack",
  "linear",
] as const;

export type AutomationIntegrationOption =
  (typeof AUTOMATION_INTEGRATION_OPTIONS)[number];

export const AUTOMATION_TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
] as const;

export const AUTOMATION_PROMPT_TOKENS = [
  "{{trigger.repo}}",
  "{{trigger.branch}}",
  "{{event.author}}",
  "{{event.title}}",
] as const;

export type AutomationCreateDraftStatus = "interviewing" | "created";

export interface AutomationCreateDraft {
  conversationId: string;
  name: string;
  prompt: string;
  triggerType: AutomationTriggerType | null;
  schedulePreset: AutomationSchedulePreset | null;
  cronExpression: string;
  timezone: string;
  integration: AutomationIntegrationOption;
  selectedEvents: string[];
  repository: string;
  branch: string;
  notification: string;
  /** Catalog ids the agent (or user) said this automation needs. */
  requiredIntegrations: string[];
  tokensResolved: boolean;
  status: AutomationCreateDraftStatus;
  createdAutomationId: string | null;
  appliedFenceKeys: string[];
}

export function createEmptyAutomationDraft(
  conversationId: string,
): AutomationCreateDraft {
  return {
    conversationId,
    name: "",
    prompt: "",
    triggerType: null,
    schedulePreset: null,
    cronExpression: "",
    timezone: "America/New_York",
    integration: "github",
    selectedEvents: [],
    repository: "",
    branch: "",
    notification: "",
    requiredIntegrations: [],
    tokensResolved: false,
    status: "interviewing",
    createdAutomationId: null,
    appliedFenceKeys: [],
  };
}

export function hasSchedule(draft: AutomationCreateDraft): boolean {
  if (!draft.schedulePreset) return false;
  if (draft.schedulePreset === "custom") {
    return draft.cronExpression.trim().length > 0;
  }
  return true;
}

export function hasEvents(draft: AutomationCreateDraft): boolean {
  return draft.selectedEvents.length > 0;
}

export function resolveDraftCron(draft: AutomationCreateDraft): string {
  if (draft.schedulePreset === "custom") {
    return draft.cronExpression.trim();
  }
  if (draft.schedulePreset) {
    return AUTOMATION_SCHEDULE_CRONS[draft.schedulePreset];
  }
  return "";
}

export function getNextInterviewField(
  draft: AutomationCreateDraft,
): AutomationInterviewField {
  if (draft.status === "created") return "review";
  if (!draft.prompt.trim()) return "intent";
  if (!draft.triggerType) return "triggerType";
  if (draft.triggerType === "schedule" && !hasSchedule(draft)) {
    return "schedule";
  }
  if (draft.triggerType === "event" && !hasEvents(draft)) return "events";
  if (!draft.name.trim()) return "name";
  if (!draft.tokensResolved) return "tokens";
  return "review";
}

export interface AutomationIntegrationHints {
  name?: string | null;
  prompt?: string | null;
  notification?: string | null;
  /** Event-trigger source (github/slack/linear). Omit for schedule triggers. */
  eventSource?: string | null;
  /** Catalog ids declared by the agent or a previous patch. */
  declaredIds?: string[] | null;
}

export function integrationHintsFromDraft(
  draft: Pick<
    AutomationCreateDraft,
    | "name"
    | "prompt"
    | "notification"
    | "triggerType"
    | "integration"
    | "requiredIntegrations"
  >,
): AutomationIntegrationHints {
  return {
    name: draft.name,
    prompt: draft.prompt,
    notification: draft.notification,
    eventSource: draft.triggerType === "event" ? draft.integration : null,
    declaredIds: draft.requiredIntegrations,
  };
}

export function integrationHintsFromAutomation(
  automation: Pick<Automation, "name" | "prompt" | "notification" | "trigger">,
): AutomationIntegrationHints {
  return {
    name: automation.name,
    prompt: automation.prompt,
    notification: automation.notification,
    eventSource:
      automation.trigger.type === "event" ? automation.trigger.source : null,
  };
}

/**
 * Integrations this draft or saved automation needs to run.
 * Unions the event source, agent-declared catalog ids, and catalog name/id
 * matches in the copy. Ambiguous English words (linear, Monday, box) are
 * not inferred from text.
 */
export function inferRequiredIntegrationIds(
  hints: AutomationIntegrationHints,
): string[] {
  const ids = new Set<string>();
  if (hints.eventSource) {
    ids.add(hints.eventSource);
  }
  for (const id of hints.declaredIds ?? []) {
    ids.add(id);
  }
  const haystack = [hints.name, hints.prompt, hints.notification]
    .filter((value): value is string => !!value)
    .join("\n");
  for (const id of matchCatalogIntegrationIds(haystack)) {
    ids.add(id);
  }
  return [...ids];
}

export function canCreateAutomationFromDraft(
  draft: AutomationCreateDraft,
): boolean {
  if (!draft.name.trim() || !draft.prompt.trim() || !draft.triggerType) {
    return false;
  }
  if (draft.triggerType === "schedule") return hasSchedule(draft);
  return hasEvents(draft);
}

export function draftToAutomationSpec(
  draft: AutomationCreateDraft,
): AutomationSpec {
  if (!canCreateAutomationFromDraft(draft)) {
    throw new Error("Automation draft is incomplete.");
  }

  const trigger: AutomationTrigger =
    draft.triggerType === "event"
      ? {
          type: "event",
          source: draft.integration,
          on: draft.selectedEvents,
        }
      : {
          type: "cron",
          schedule: resolveDraftCron(draft),
          timezone: draft.timezone,
        };

  return {
    name: draft.name.trim(),
    prompt: draft.prompt.trim(),
    enabled: false,
    trigger,
    timezone: draft.timezone,
    ...(draft.repository.trim() && { repository: draft.repository.trim() }),
    ...(draft.branch.trim() && { branch: draft.branch.trim() }),
    ...(draft.notification.trim() && {
      notification: draft.notification.trim(),
    }),
  };
}

export function isInterviewReply(text: string): boolean {
  return text.trimStart().startsWith(AUTOMATION_INTERVIEW_REPLY_PREFIX);
}

export function formatInterviewReply(
  field: AutomationInterviewField,
  summary: string,
): string {
  return `${AUTOMATION_INTERVIEW_REPLY_PREFIX} ${field}=${summary}`;
}

export function parseInterviewReply(
  text: string,
): { field: string; summary: string } | null {
  if (!isInterviewReply(text)) return null;
  const rest = text
    .trimStart()
    .slice(AUTOMATION_INTERVIEW_REPLY_PREFIX.length)
    .trim();
  const separator = rest.indexOf("=");
  if (separator <= 0) return null;
  return {
    field: rest.slice(0, separator),
    summary: rest.slice(separator + 1),
  };
}

export function isAutomationInterviewSeedPrompt(text: string): boolean {
  return text.trimStart().startsWith(AUTOMATION_INTERVIEW_SEED_PREFIX);
}

const FENCE_LANGS = `${AUTOMATION_DRAFT_FENCE}|${AUTOMATION_UI_FENCE}|automation|json`;
const FENCE_PATTERN = new RegExp(
  "```(" + FENCE_LANGS + ")\\s*\\n([\\s\\S]*?)```",
  "g",
);
const INCOMPLETE_FENCE_PATTERN = new RegExp(
  "```(" + FENCE_LANGS + ")[^\\n]*\\n?[\\s\\S]*$",
);

function parseFenceObject(body: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

function isInterviewControlPayload(parsed: Record<string, unknown>): boolean {
  if (isInterviewField(parsed.field)) return true;
  return Object.keys(sanitizeDraftPatch(parsed)).length > 0;
}

function isInterviewField(value: unknown): value is AutomationInterviewField {
  return (
    typeof value === "string" &&
    (AUTOMATION_INTERVIEW_FIELDS as readonly string[]).includes(value)
  );
}

function isTriggerType(value: unknown): value is AutomationTriggerType {
  return value === "schedule" || value === "event";
}

function isSchedulePreset(value: unknown): value is AutomationSchedulePreset {
  return (
    typeof value === "string" &&
    (AUTOMATION_SCHEDULE_PRESETS as readonly string[]).includes(value)
  );
}

function isIntegration(value: unknown): value is AutomationIntegrationOption {
  return (
    typeof value === "string" &&
    (AUTOMATION_INTEGRATION_OPTIONS as readonly string[]).includes(value)
  );
}

export function sanitizeDraftPatch(
  raw: unknown,
): Partial<AutomationCreateDraft> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const input = raw as Record<string, unknown>;
  const patch: Partial<AutomationCreateDraft> = {};

  if (typeof input.name === "string") patch.name = input.name;
  if (typeof input.prompt === "string") patch.prompt = input.prompt;
  else if (typeof input.intent === "string") patch.prompt = input.intent;
  if (isTriggerType(input.triggerType)) patch.triggerType = input.triggerType;
  if (isSchedulePreset(input.schedulePreset)) {
    patch.schedulePreset = input.schedulePreset;
  }
  if (typeof input.cronExpression === "string") {
    patch.cronExpression = input.cronExpression;
  }
  if (typeof input.timezone === "string" && input.timezone.trim()) {
    patch.timezone = input.timezone;
  }
  if (isIntegration(input.integration)) patch.integration = input.integration;
  if (Array.isArray(input.selectedEvents)) {
    patch.selectedEvents = input.selectedEvents.filter(
      (event): event is string => typeof event === "string" && event.length > 0,
    );
  }
  if (typeof input.repository === "string") patch.repository = input.repository;
  if (typeof input.branch === "string") patch.branch = input.branch;
  if (typeof input.notification === "string") {
    patch.notification = input.notification;
  }
  const requiredIntegrations = sanitizeCatalogIntegrationIds(
    input.requiredIntegrations,
  );
  if (requiredIntegrations.length > 0) {
    patch.requiredIntegrations = requiredIntegrations;
  }
  if (input.tokensResolved === true) patch.tokensResolved = true;

  return patch;
}

export interface ParsedAutomationInterviewFences {
  draftPatches: Array<{ key: string; patch: Partial<AutomationCreateDraft> }>;
  uiFields: Array<{ key: string; field: AutomationInterviewField }>;
}

export function parseAutomationInterviewFences(
  text: string,
): ParsedAutomationInterviewFences {
  const draftPatches: ParsedAutomationInterviewFences["draftPatches"] = [];
  const uiFields: ParsedAutomationInterviewFences["uiFields"] = [];
  const pattern = new RegExp(FENCE_PATTERN.source, "g");

  for (const match of text.matchAll(pattern)) {
    const kind = match[1];
    const body = match[2]?.trim() ?? "";
    const key = `${kind}:${body}`;
    const parsed = parseFenceObject(body);
    if (!parsed) continue;

    if (kind === AUTOMATION_DRAFT_FENCE) {
      const patch = sanitizeDraftPatch(parsed);
      if (Object.keys(patch).length > 0) {
        draftPatches.push({ key, patch });
      }
      continue;
    }

    if (kind === AUTOMATION_UI_FENCE) {
      if (isInterviewField(parsed.field)) {
        uiFields.push({
          key,
          field: parsed.field,
        });
      }
      continue;
    }

    if (isInterviewField(parsed.field)) {
      uiFields.push({
        key,
        field: parsed.field,
      });
    }
    const patch = sanitizeDraftPatch(parsed);
    if (Object.keys(patch).length > 0) {
      draftPatches.push({ key, patch });
    }
  }

  return { draftPatches, uiFields };
}

function shouldStripIncompleteFence(lang: string, rest: string): boolean {
  if (
    lang === AUTOMATION_DRAFT_FENCE ||
    lang === AUTOMATION_UI_FENCE ||
    lang === "automation"
  ) {
    return true;
  }
  return /"(field|prompt|intent|triggerType|requiredIntegrations|schedulePreset)"/.test(
    rest,
  );
}

/** Remove interview control fences so chat does not duplicate the picker. */
export function stripAutomationInterviewFences(text: string): string {
  const pattern = new RegExp(FENCE_PATTERN.source, "g");
  let result = text.replace(pattern, (full, lang: string, body: string) => {
    if (lang === AUTOMATION_DRAFT_FENCE || lang === AUTOMATION_UI_FENCE) {
      return "";
    }
    const parsed = parseFenceObject(body);
    return parsed && isInterviewControlPayload(parsed) ? "" : full;
  });

  const incomplete = result.match(INCOMPLETE_FENCE_PATTERN);
  if (
    incomplete?.[1] &&
    shouldStripIncompleteFence(incomplete[1], incomplete[0])
  ) {
    result = result.slice(0, incomplete.index);
  }

  return result.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Chat-facing copy for an interview message. Returns null when the bubble
 * should be hidden (seed prompt, or an agent message that was only fences).
 */
export function presentInterviewChatMessage(
  text: string,
  source: "user" | "agent",
): string | null {
  if (source === "user") {
    if (isAutomationInterviewSeedPrompt(text)) return null;
    const reply = parseInterviewReply(text);
    return reply ? reply.summary : text;
  }
  const stripped = stripAutomationInterviewFences(text);
  return stripped.length > 0 ? stripped : null;
}

export function applyFreeTextToDraft(
  draft: AutomationCreateDraft,
  text: string,
): Partial<AutomationCreateDraft> | null {
  const trimmed = text.trim();
  if (!trimmed || isInterviewReply(trimmed)) return null;

  const field = getNextInterviewField(draft);
  if (field === "intent") return { prompt: trimmed };
  if (field === "name") return { name: trimmed };
  return null;
}

export function insertTokenIntoPrompt(prompt: string, token: string): string {
  if (!prompt) return token;
  if (prompt.endsWith(" ") || prompt.endsWith("\n")) return `${prompt}${token}`;
  return `${prompt} ${token}`;
}

export function suggestNameFromPrompt(prompt: string): string {
  const firstLine = prompt.trim().split(/\n/)[0] ?? "";
  return firstLine.slice(0, 48).trim();
}
