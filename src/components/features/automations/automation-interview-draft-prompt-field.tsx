import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { AutomationInterviewDraftModelPicker } from "./automation-interview-draft-model-picker";
import { AutomationInterviewPromptBottomGrip } from "./automation-interview-prompt-bottom-grip";
import { AutomationInterviewRepositoryField } from "./automation-interview-repository-field";
import { I18nKey } from "#/i18n/declaration";
import { usePromptTextareaResize } from "#/hooks/use-prompt-textarea-resize";
import { cn } from "#/utils/utils";

interface AutomationInterviewDraftPromptFieldProps {
  prompt: string;
  model: string;
  repository: string;
  onPatch: (patch: {
    prompt?: string;
    model?: string;
    repository?: string;
  }) => void;
}

export function AutomationInterviewDraftPromptField({
  prompt,
  model,
  repository,
  onPatch,
}: AutomationInterviewDraftPromptFieldProps) {
  const { t } = useTranslation("openhands");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { gripRef, isGripDragging, handleGripMouseDown, handleGripTouchStart } =
    usePromptTextareaResize(textareaRef);

  return (
    <label className="flex flex-col gap-2.5 w-full min-w-0">
      <span className="text-sm">{t(I18nKey.AUTOMATIONS$PROMPT)}</span>
      <div
        data-testid="automation-interview-draft-prompt-stack"
        className="relative w-full"
      >
        <div
          data-testid="automation-interview-draft-prompt-container"
          className={cn(
            "relative z-10 -mb-[15px] flex flex-col rounded-[15px] border border-[var(--oh-border)] bg-[var(--oh-surface)] p-4",
          )}
        >
          <textarea
            ref={textareaRef}
            data-testid="automation-interview-draft-prompt"
            name="prompt"
            value={prompt}
            onChange={(event) => onPatch({ prompt: event.target.value })}
            placeholder={t(I18nKey.AUTOMATIONS$INTERVIEW_INTENT_PLACEHOLDER)}
            rows={5}
            className={cn(
              "min-h-[120px] w-full resize-none border-0 bg-transparent p-0 text-sm text-content outline-none placeholder:text-tertiary-alt placeholder:italic",
            )}
          />
          <div className="flex min-w-0 items-center pt-2">
            <AutomationInterviewDraftModelPicker
              value={model}
              onChange={(nextModel) => onPatch({ model: nextModel })}
            />
          </div>
          <AutomationInterviewPromptBottomGrip
            gripRef={gripRef}
            isGripDragging={isGripDragging}
            onMouseDown={handleGripMouseDown}
            onTouchStart={handleGripTouchStart}
          />
        </div>
        <div
          data-testid="automation-interview-draft-prompt-drawer"
          className="flex min-h-9 items-center rounded-b-[15px] bg-[var(--oh-surface-raised)] px-4 pb-3 pt-[calc(15px+0.5rem)]"
        >
          <AutomationInterviewRepositoryField
            repository={repository}
            onChange={(nextRepository) =>
              onPatch({ repository: nextRepository })
            }
          />
        </div>
      </div>
    </label>
  );
}
