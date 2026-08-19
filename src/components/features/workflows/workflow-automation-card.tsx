import { Zap } from "lucide-react";
import type { WorkflowStageAutomation } from "#/fixtures/workflows-automations-mock";
import {
  extensionModuleCardInteractiveClassName,
  extensionModuleCardSurfaceClassName,
} from "#/utils/extension-module-card-classes";
import { cn } from "#/utils/utils";

interface WorkflowAutomationCardProps {
  automation: WorkflowStageAutomation;
  isDragging: boolean;
  onDragStart: (automationId: string) => void;
  onDragEnd: () => void;
}

export function WorkflowAutomationCard({
  automation,
  isDragging,
  onDragStart,
  onDragEnd,
}: WorkflowAutomationCardProps) {
  return (
    <article
      draggable
      data-testid={`workflow-automation-card-${automation.id}`}
      aria-grabbed={isDragging}
      aria-label={automation.name}
      onDragStart={() => onDragStart(automation.id)}
      onDragEnd={onDragEnd}
      className={cn(
        extensionModuleCardSurfaceClassName,
        extensionModuleCardInteractiveClassName,
        "cursor-grab p-3 active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start gap-2">
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--oh-border)] bg-[var(--oh-surface-deep)]"
        >
          <Zap className="h-3.5 w-3.5 text-[var(--oh-interactive-hover)]" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-content">
            {automation.name}
          </h3>
          {automation.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-tertiary-light">
              {automation.description}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
