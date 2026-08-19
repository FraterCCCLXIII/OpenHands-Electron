import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import {
  WORKFLOW_SOURCE_KINDS,
  type WorkflowSdlcStage,
  type WorkflowSourceKind,
} from "#/types/workflow";
import {
  WORKFLOW_SOURCE_ACCENT_COLORS,
  WORKFLOW_SOURCE_LABEL_KEYS,
} from "#/utils/workflow-source-labels";
import { cn } from "#/utils/utils";

interface WorkflowColumnSourcesProps {
  stage: WorkflowSdlcStage;
  activeSources: WorkflowSourceKind[];
  onAddSource: (source: WorkflowSourceKind) => void;
  onRemoveSource: (source: WorkflowSourceKind) => void;
}

export function WorkflowColumnSources({
  stage,
  activeSources,
  onAddSource,
  onRemoveSource,
}: WorkflowColumnSourcesProps) {
  const { t } = useTranslation("openhands");
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const availableSources = useMemo(
    () =>
      WORKFLOW_SOURCE_KINDS.filter((source) => !activeSources.includes(source)),
    [activeSources],
  );

  return (
    <div
      data-testid={`workflow-column-sources-${stage}`}
      className="flex flex-wrap items-center gap-1.5"
    >
      {activeSources.map((source) => (
        <WorkflowSourceChip
          key={source}
          stage={stage}
          source={source}
          label={t(WORKFLOW_SOURCE_LABEL_KEYS[source])}
          onRemove={() => onRemoveSource(source)}
          removeLabel={t(I18nKey.WORKFLOWS$REMOVE_SOURCE_ARIA, {
            source: t(WORKFLOW_SOURCE_LABEL_KEYS[source]),
          })}
        />
      ))}

      {availableSources.length > 0 ? (
        <div className="relative">
          <button
            type="button"
            data-testid={`workflow-add-source-button-${stage}`}
            aria-expanded={isAddMenuOpen}
            aria-haspopup="menu"
            onClick={() => setIsAddMenuOpen((open) => !open)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--oh-border)]",
              "px-2 py-0.5 text-[11px] font-medium text-muted transition-colors",
              "hover:border-[var(--oh-border-strong)] hover:text-content",
            )}
          >
            <Plus aria-hidden="true" className="h-3 w-3" />
            {t(I18nKey.WORKFLOWS$ADD_SOURCE)}
          </button>

          {isAddMenuOpen ? (
            <div
              role="menu"
              data-testid={`workflow-add-source-menu-${stage}`}
              className="absolute left-0 top-full z-20 mt-1 min-w-[9rem] rounded-lg border border-[var(--oh-border)] bg-[var(--oh-surface)] p-1 shadow-lg"
            >
              {availableSources.map((source) => (
                <button
                  key={source}
                  type="button"
                  role="menuitem"
                  data-testid={`workflow-add-source-option-${stage}-${source}`}
                  onClick={() => {
                    onAddSource(source);
                    setIsAddMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-content hover:bg-[var(--oh-surface-deep)]"
                >
                  <WorkflowSourceDot source={source} />
                  {t(WORKFLOW_SOURCE_LABEL_KEYS[source])}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface WorkflowSourceChipProps {
  stage: WorkflowSdlcStage;
  source: WorkflowSourceKind;
  label: string;
  onRemove: () => void;
  removeLabel: string;
}

function WorkflowSourceChip({
  stage,
  source,
  label,
  onRemove,
  removeLabel,
}: WorkflowSourceChipProps) {
  return (
    <span
      data-testid={`workflow-source-chip-${stage}-${source}`}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--oh-border)] bg-[var(--oh-surface)] py-0.5 pl-1.5 pr-0.5 text-[11px] text-content"
    >
      <WorkflowSourceDot source={source} />
      <span>{label}</span>
      <button
        type="button"
        data-testid={`workflow-remove-source-${stage}-${source}`}
        aria-label={removeLabel}
        onClick={onRemove}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted transition-colors hover:bg-[var(--oh-surface-deep)] hover:text-content"
      >
        <X aria-hidden="true" className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

function WorkflowSourceDot({ source }: { source: WorkflowSourceKind }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: WORKFLOW_SOURCE_ACCENT_COLORS[source] }}
    />
  );
}
