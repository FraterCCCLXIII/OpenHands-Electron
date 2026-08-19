import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WorkflowRecommendedAutomation } from "#/fixtures/workflows-recommended-mock";
import { I18nKey } from "#/i18n/declaration";
import type { WorkflowSdlcStage } from "#/types/workflow";
import { cn } from "#/utils/utils";

interface WorkflowColumnRecommendedAutomationsProps {
  stage: WorkflowSdlcStage;
  recommendations: WorkflowRecommendedAutomation[];
  onAddRecommendation: (recommendation: WorkflowRecommendedAutomation) => void;
}

export function WorkflowColumnRecommendedAutomations({
  stage,
  recommendations,
  onAddRecommendation,
}: WorkflowColumnRecommendedAutomationsProps) {
  const { t } = useTranslation("openhands");

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section
      data-testid={`workflow-column-recommended-${stage}`}
      className="shrink-0 border-t border-[var(--oh-border)] bg-[var(--oh-surface-deep)]/60 p-2"
    >
      <h3 className="px-1 text-[10px] font-medium uppercase tracking-wide text-muted">
        {t(I18nKey.WORKFLOWS$RECOMMENDED_AUTOMATIONS_LABEL)}
      </h3>
      <ul className="mt-1.5 flex flex-col gap-1.5">
        {recommendations.map((recommendation) => (
          <li key={recommendation.id}>
            <div
              data-testid={`workflow-recommended-automation-${recommendation.id}`}
              className="flex items-start gap-2 rounded-lg border border-[var(--oh-border)] bg-[var(--oh-surface)] px-2 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-content">
                  {recommendation.name}
                </p>
                {recommendation.description ? (
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-tertiary-light">
                    {recommendation.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                data-testid={`workflow-add-recommended-automation-${recommendation.id}`}
                aria-label={t(
                  I18nKey.WORKFLOWS$ADD_RECOMMENDED_AUTOMATION_ARIA,
                  {
                    name: recommendation.name,
                  },
                )}
                onClick={() => onAddRecommendation(recommendation)}
                className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center rounded-full",
                  "border border-[var(--oh-border)] bg-base-secondary text-content transition-colors",
                  "hover:border-[var(--oh-border-strong)] hover:bg-[var(--oh-interactive-hover)]",
                )}
              >
                <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
