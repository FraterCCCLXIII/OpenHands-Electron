import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddAutomationModal } from "#/components/features/automations/add-automation-modal";
import { I18nKey } from "#/i18n/declaration";
import type { WorkflowSdlcStage } from "#/types/workflow";
import { cn } from "#/utils/utils";

interface WorkflowColumnAutomationsProps {
  stage: WorkflowSdlcStage;
}

export function WorkflowColumnAutomations({
  stage,
}: WorkflowColumnAutomationsProps) {
  const { t } = useTranslation("openhands");
  const [isAddAutomationOpen, setIsAddAutomationOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-testid={`workflow-add-automation-${stage}`}
        onClick={() => setIsAddAutomationOpen(true)}
        className={cn(
          "inline-flex w-full items-center justify-center gap-1 rounded-full border border-dashed border-[var(--oh-border)]",
          "px-2 py-1 text-[11px] font-medium text-muted transition-colors",
          "hover:border-[var(--oh-border-strong)] hover:text-content",
        )}
      >
        <Plus aria-hidden="true" className="h-3 w-3" />
        {t(I18nKey.AUTOMATIONS$ADD_AUTOMATION)}
      </button>

      <AddAutomationModal
        isOpen={isAddAutomationOpen}
        onClose={() => setIsAddAutomationOpen(false)}
      />
    </>
  );
}
