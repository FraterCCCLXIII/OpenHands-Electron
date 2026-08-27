import {
  AutomationRunStatus,
  type AutomationRun,
  type AutomationRunStatusDetail,
} from "#/types/automation";
import { getAutomationRunDisplay } from "#/utils/automation-run-display";

export function messagesOverlap(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const a = left?.trim().toLowerCase() ?? "";
  const b = right?.trim().toLowerCase() ?? "";
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function stringifyDetailValue(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

export function getStatusDetailContext(
  statusDetail: AutomationRunStatusDetail | null | undefined,
): string | null {
  if (!statusDetail) return null;
  const context = [
    stringifyDetailValue(statusDetail.phase),
    stringifyDetailValue(statusDetail.kind),
    stringifyDetailValue(statusDetail.source),
    stringifyDetailValue(statusDetail.operation),
    stringifyDetailValue(statusDetail.code),
    stringifyDetailValue(statusDetail.status_code),
  ].filter(Boolean);
  return context.length > 0 ? context.join(" · ") : null;
}

export function formatStatusDetail(
  statusDetail: AutomationRunStatusDetail | null | undefined,
): string | null {
  if (!statusDetail) return null;
  const primary =
    stringifyDetailValue(statusDetail.formatted_detail) ??
    stringifyDetailValue(statusDetail.detail);
  const context = getStatusDetailContext(statusDetail);

  if (primary && context) return `${primary} (${context})`;
  if (primary) return primary;
  if (context) return context;
  try {
    return JSON.stringify(statusDetail);
  } catch {
    return null;
  }
}

export interface SystemInspection {
  /** `error_detail`, shown once. */
  error: string | null;
  /** Status prose that is not already covered by {@link error}. */
  statusDetail: string | null;
  /** Machine tags when the status sentence already appeared as {@link error}. */
  context: string | null;
}

export function getSystemInspection(
  run: Pick<AutomationRun, "error_detail" | "status_detail">,
): SystemInspection {
  const error = run.error_detail?.trim() || null;
  const primary =
    stringifyDetailValue(run.status_detail?.formatted_detail) ??
    stringifyDetailValue(run.status_detail?.detail);
  const context = getStatusDetailContext(run.status_detail);
  const formatted = formatStatusDetail(run.status_detail);

  if (!error) {
    return { error: null, statusDetail: formatted, context: null };
  }

  const overlapsPrimary = messagesOverlap(error, primary);
  const overlapsFormatted = messagesOverlap(error, formatted);
  return {
    error,
    statusDetail:
      formatted && !overlapsPrimary && !overlapsFormatted ? formatted : null,
    context: context && (overlapsPrimary || !primary) ? context : null,
  };
}

export function formatRunCost(cost: number | null | undefined): string | null {
  if (typeof cost !== "number" || !Number.isFinite(cost)) return null;
  return `$${cost.toFixed(4)}`;
}

export function formatRunMetaTimestamp(
  dateStr: string,
  locale: string,
): string {
  return new Date(dateStr).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function humanizeMetadataKey(key: string): string {
  const spaced = key.replace(/_/g, " ").trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function formatMetadataValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => formatMetadataValue(item))
      .filter(Boolean)
      .join(", ");
  }
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export interface MetadataEntry {
  key: string;
  label: string;
  value: string;
}

export function getMetadataEntries(metadata: unknown): MetadataEntry[] {
  if (
    typeof metadata !== "object" ||
    metadata === null ||
    Array.isArray(metadata)
  ) {
    return [];
  }
  return Object.entries(metadata).flatMap(([key, value]) => {
    const formatted = formatMetadataValue(value);
    if (!formatted) return [];
    return [{ key, label: humanizeMetadataKey(key), value: formatted }];
  });
}

export function shouldShowRunDebugAction(run: AutomationRun): boolean {
  if (run.status === AutomationRunStatus.FAILED) return true;
  const { badgeStatus } = getAutomationRunDisplay(run);
  return badgeStatus === "failed" || badgeStatus === "blocked";
}
