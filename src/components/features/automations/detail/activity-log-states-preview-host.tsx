import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import { CircleHelp } from "lucide-react";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "#/icons/check-circle.svg?react";
import CheckCircleHalfIcon from "#/icons/u-check-circle-half.svg?react";
import ExclamationCircleIcon from "#/icons/exclamation-circle.svg?react";
import XCircleIcon from "#/icons/x-circle.svg?react";
import { NavigationLink } from "#/components/shared/navigation-link";
import { useBackendScopedPath } from "#/hooks/use-backend-scoped-path";
import { usePaginatedConversations } from "#/hooks/query/use-paginated-conversations";
import { I18nKey } from "#/i18n/declaration";
import { AutomationRunStatus } from "#/types/automation";
import { cn } from "#/utils/utils";
import { RunStatusBadge } from "./run-status-badge";

type TaskOutcomeStatus =
  | "success"
  | "partial_success"
  | "blocked"
  | "failed"
  | "unknown";

interface CatalogRow {
  caseLabel: string;
  time: string;
  summary?: string;
  error?: string;
  cost?: string;
  lifecycle: AutomationRunStatus;
  task?: TaskOutcomeStatus;
}

const ROWS: CatalogRow[] = [
  {
    caseLabel: "PENDING — no task outcome yet",
    time: "Aug 19, 2026, 7:00 PM",
    lifecycle: AutomationRunStatus.PENDING,
  },
  {
    caseLabel: "RUNNING — no task outcome yet",
    time: "Aug 19, 2026, 7:02 PM",
    lifecycle: AutomationRunStatus.RUNNING,
  },
  {
    caseLabel: "COMPLETED — no finish_tool_response",
    time: "Aug 19, 2026, 7:04 PM",
    cost: "$0.0412",
    lifecycle: AutomationRunStatus.COMPLETED,
  },
  {
    caseLabel: "COMPLETED + success",
    time: "Aug 19, 2026, 7:12 PM",
    summary: "Printed hello world successfully.",
    cost: "$0.1357",
    lifecycle: AutomationRunStatus.COMPLETED,
    task: "success",
  },
  {
    caseLabel: "COMPLETED + blocked — HubSpot case",
    time: "Aug 19, 2026, 7:24 PM",
    summary:
      "Attempted HubSpot CRM contact search but HUBSPOT_API_KEY was unavailable.",
    error: "HUBSPOT_API_KEY is not available in the environment.",
    cost: "$0.2885",
    lifecycle: AutomationRunStatus.COMPLETED,
    task: "blocked",
  },
  {
    caseLabel: "COMPLETED + failed",
    time: "Aug 19, 2026, 7:26 PM",
    summary:
      "Could not write the digest. The feed returned 403 and retries were exhausted.",
    cost: "$0.1920",
    lifecycle: AutomationRunStatus.COMPLETED,
    task: "failed",
  },
  {
    caseLabel: "COMPLETED + partial_success",
    time: "Aug 19, 2026, 7:28 PM",
    summary:
      "Posted 4 of 6 items. Two feeds timed out; skipped those sources and continued.",
    cost: "$0.2104",
    lifecycle: AutomationRunStatus.COMPLETED,
    task: "partial_success",
  },
  {
    caseLabel: "COMPLETED + unknown → Needs review",
    time: "Aug 19, 2026, 7:30 PM",
    summary:
      "Finished the run but could not assess whether the task succeeded.",
    cost: "$0.0881",
    lifecycle: AutomationRunStatus.COMPLETED,
    task: "unknown",
  },
  {
    caseLabel: "FAILED — system / execution error",
    time: "Aug 19, 2026, 7:32 PM",
    summary: "The run stopped before the task finished.",
    error: "Sandbox timed out before the agent could finish.",
    cost: "$0.0200",
    lifecycle: AutomationRunStatus.FAILED,
  },
  {
    caseLabel: "CANCELLED",
    time: "Aug 19, 2026, 7:34 PM",
    lifecycle: AutomationRunStatus.CANCELLED,
  },
  {
    caseLabel: "SKIPPED",
    time: "Aug 19, 2026, 7:36 PM",
    lifecycle: AutomationRunStatus.SKIPPED,
  },
];

const TASK_BADGE: Record<
  TaskOutcomeStatus,
  {
    label: string;
    style: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
  }
> = {
  success: {
    label: "Successful",
    style: "bg-[var(--oh-success)]/10 text-[var(--oh-success)]",
    Icon: CheckCircleIcon,
  },
  partial_success: {
    label: "Partial",
    style: "bg-[var(--oh-warning)]/10 text-[var(--oh-warning)]",
    Icon: CheckCircleHalfIcon,
  },
  blocked: {
    label: "Blocked",
    style: "bg-[var(--oh-warning)]/10 text-[var(--oh-warning)]",
    Icon: ExclamationCircleIcon,
  },
  failed: {
    label: "Failed",
    style: "bg-[var(--oh-danger)]/10 text-danger",
    Icon: XCircleIcon,
  },
  unknown: {
    label: "Needs review",
    style: "bg-[var(--oh-warning)]/10 text-[var(--oh-warning)]",
    Icon: CircleHelp,
  },
};

function PreviewLogSecondary({
  summary,
  error,
}: {
  summary?: string;
  error?: string;
}) {
  const { t } = useTranslation("openhands");
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return undefined;

    const measure = () => {
      setOverflows(el.scrollWidth - el.clientWidth > 1);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [summary, error, expanded]);

  if (!summary && !error) return null;

  const collapsedWithToggle = overflows && !expanded;

  return (
    <div
      className={cn(
        "mt-1 min-w-0",
        collapsedWithToggle &&
          "grid grid-cols-[minmax(0,1fr)_auto] items-baseline",
      )}
    >
      <p
        ref={textRef}
        data-testid="activity-log-secondary"
        className={cn(
          "min-w-0 w-full text-xs leading-normal",
          !expanded && "truncate",
        )}
      >
        {summary ? <span className="text-muted">{summary}</span> : null}
        {summary && error ? " " : null}
        {error ? (
          <span data-testid="activity-log-error-row" className="text-danger">
            {error}
          </span>
        ) : null}
      </p>
      {overflows ? (
        <button
          type="button"
          data-testid="activity-log-read-more"
          aria-expanded={expanded}
          className={cn(
            "shrink-0 cursor-pointer p-0 text-xs leading-normal text-[var(--oh-text-secondary)] transition-colors hover:text-[var(--oh-foreground)]",
            expanded && "mt-0.5",
          )}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          {expanded ? t(I18nKey.COMMON$VIEW_LESS) : t(I18nKey.COMMON$READ_MORE)}
        </button>
      ) : null}
    </div>
  );
}

function TaskOutcomeBadge({ status }: { status: TaskOutcomeStatus }) {
  const { label, style, Icon } = TASK_BADGE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 text-xs font-medium",
        style,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

function PreviewLogRow({
  row,
  badgeMode,
  conversationHref,
}: {
  row: CatalogRow;
  badgeMode: "lifecycle" | "task";
  conversationHref: string | null;
}) {
  const showTaskBadge = badgeMode === "task" && row.task;
  const hasSecondary = Boolean(row.summary || row.error);
  const label = `View conversation for run at ${row.time}`;
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-content">{row.time}</p>
        <PreviewLogSecondary summary={row.summary} error={row.error} />
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center gap-2.5",
          hasSecondary && "pt-0.5",
        )}
      >
        {row.cost ? (
          <span className="text-xs tabular-nums text-muted">{row.cost}</span>
        ) : null}
        {showTaskBadge ? (
          <TaskOutcomeBadge status={row.task!} />
        ) : (
          <RunStatusBadge status={row.lifecycle} />
        )}
      </div>
    </>
  );
  const rowClassName = cn(
    "flex justify-between gap-6 border-t border-[var(--oh-border)] px-5 py-3.5 transition-colors first:border-t-0",
    "hover:bg-surface-raised focus:bg-surface-raised focus:outline-none",
    hasSecondary ? "items-start" : "items-center",
    conversationHref ? "cursor-pointer" : "cursor-default",
  );

  if (conversationHref) {
    return (
      <NavigationLink
        to={conversationHref}
        aria-label={label}
        className={rowClassName}
      >
        {content}
      </NavigationLink>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}

/** Recommended-badge catalog for the real Activity Log on the detail page. */
export function ActivityLogStatesPreviewRows() {
  const backendScopedPath = useBackendScopedPath();
  const { data } = usePaginatedConversations(1);
  const conversationId = data?.pages[0]?.items[0]?.id ?? null;
  const conversationHref = conversationId
    ? backendScopedPath(`/conversations/${conversationId}`)
    : null;

  return (
    <div>
      {ROWS.map((row) => (
        <PreviewLogRow
          key={row.caseLabel}
          row={row}
          badgeMode="task"
          conversationHref={conversationHref}
        />
      ))}
    </div>
  );
}
