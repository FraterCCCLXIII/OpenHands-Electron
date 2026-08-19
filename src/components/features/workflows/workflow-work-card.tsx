import { Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import type { WorkflowItem } from "#/types/workflow";
import {
  extensionModuleCardInteractiveClassName,
  extensionModuleCardSurfaceClassName,
} from "#/utils/extension-module-card-classes";
import {
  WORKFLOW_SOURCE_ACCENT_COLORS,
  WORKFLOW_SOURCE_LABEL_KEYS,
} from "#/utils/workflow-source-labels";
import { cn } from "#/utils/utils";

interface WorkflowWorkCardProps {
  item: WorkflowItem;
  automationName?: string;
  isDragging: boolean;
  onDragStart: (itemId: string) => void;
  onDragEnd: () => void;
}

export function WorkflowWorkCard({
  item,
  automationName,
  isDragging,
  onDragStart,
  onDragEnd,
}: WorkflowWorkCardProps) {
  const { t } = useTranslation("openhands");

  return (
    <article
      draggable
      data-testid={`workflow-card-${item.id}`}
      aria-grabbed={isDragging}
      aria-label={t(I18nKey.WORKFLOWS$CARD_ARIA_LABEL, { title: item.title })}
      onDragStart={() => onDragStart(item.id)}
      onDragEnd={onDragEnd}
      className={cn(
        extensionModuleCardSurfaceClassName,
        extensionModuleCardInteractiveClassName,
        "cursor-grab p-3 active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-content">{item.title}</h3>
          {item.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-tertiary-light">
              {item.description}
            </p>
          ) : null}
        </div>
        <span
          data-testid={`workflow-card-source-${item.id}`}
          className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white"
          style={{
            backgroundColor: WORKFLOW_SOURCE_ACCENT_COLORS[item.source],
          }}
        >
          {t(WORKFLOW_SOURCE_LABEL_KEYS[item.source])}
        </span>
      </div>
      {item.assignee ? (
        <p className="mt-2 text-[11px] text-muted">
          {t(I18nKey.WORKFLOWS$ASSIGNEE, { name: item.assignee })}
        </p>
      ) : null}
      {automationName ? (
        <footer
          data-testid={`workflow-card-automation-footer-${item.id}`}
          aria-label={t(I18nKey.WORKFLOWS$CARD_AUTOMATION_FOOTER_ARIA, {
            name: automationName,
          })}
          className="mt-3 flex items-center gap-1.5 border-t border-[var(--oh-border)] pt-2 text-[11px] text-tertiary-light"
        >
          <Zap
            aria-hidden="true"
            className="h-3 w-3 shrink-0 text-[var(--oh-interactive-hover)]"
          />
          <span className="truncate">{automationName}</span>
        </footer>
      ) : null}
    </article>
  );
}
