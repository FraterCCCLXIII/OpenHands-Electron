import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OptionalTag } from "#/components/features/settings/optional-tag";
import { AutomationInterviewAddRepositoryModal } from "./automation-interview-add-repository-modal";
import { I18nKey } from "#/i18n/declaration";
import { extensionModuleCardPillClassName } from "#/utils/extension-module-card-classes";
import { cn } from "#/utils/utils";

interface AutomationInterviewRepositoryFieldProps {
  repository: string;
  onChange: (repository: string) => void;
}

export function AutomationInterviewRepositoryField({
  repository,
  onChange,
}: AutomationInterviewRepositoryFieldProps) {
  const { t } = useTranslation("openhands");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const trimmedRepository = repository.trim();
  const addLabel = `${t(I18nKey.BUTTON$ADD)} ${t(I18nKey.AUTOMATIONS$DETAIL$REPOSITORIES)}`;

  return (
    <>
      <div
        data-testid="automation-interview-draft-repository"
        className="flex w-full min-w-0 items-center gap-1 overflow-x-auto"
      >
        {trimmedRepository ? (
          <span
            data-testid="automation-interview-draft-repository-value"
            className={cn(extensionModuleCardPillClassName, "gap-1 pr-1")}
          >
            <span className="truncate">{trimmedRepository}</span>
            <button
              type="button"
              data-testid="automation-interview-draft-repository-remove"
              aria-label={`${t(I18nKey.COMMON$REMOVE)} ${trimmedRepository}`}
              className="inline-flex size-4 items-center justify-center rounded-full text-tertiary-light hover:bg-white/10 hover:text-white"
              onClick={() => onChange("")}
            >
              <X className="size-3" aria-hidden />
            </button>
          </span>
        ) : null}
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm">
            {t(I18nKey.AUTOMATIONS$DETAIL$REPOSITORIES)}
          </span>
          <OptionalTag />
          <button
            type="button"
            data-testid="automation-interview-draft-repository-add"
            aria-label={addLabel}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-[var(--oh-muted)] hover:bg-white/10 hover:text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <AutomationInterviewAddRepositoryModal
        isOpen={isModalOpen}
        initialValue={trimmedRepository}
        onClose={() => setIsModalOpen(false)}
        onAdd={onChange}
      />
    </>
  );
}
