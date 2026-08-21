import React from "react";
import { useTranslation } from "react-i18next";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { ModalCloseButton } from "#/components/shared/modals/modal-close-button";
import { BrandButton } from "#/components/features/settings/brand-button";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { modalTitleLgClassName } from "#/utils/modal-classes";

interface AutomationInterviewAddRepositoryModalProps {
  isOpen: boolean;
  initialValue?: string;
  onClose: () => void;
  onAdd: (address: string) => void;
}

export function AutomationInterviewAddRepositoryModal({
  isOpen,
  initialValue = "",
  onClose,
  onAdd,
}: AutomationInterviewAddRepositoryModalProps) {
  const { t } = useTranslation("openhands");
  const [address, setAddress] = React.useState(initialValue);

  React.useEffect(() => {
    if (isOpen) {
      setAddress(initialValue);
    }
  }, [initialValue, isOpen]);

  if (!isOpen) {
    return null;
  }

  const trimmedAddress = address.trim();
  const canSubmit = trimmedAddress.length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onAdd(trimmedAddress);
    onClose();
  };

  return (
    <ModalBackdrop
      onClose={onClose}
      aria-label={t(I18nKey.AUTOMATIONS$INTERVIEW_REPO_ADD_MODAL_TITLE)}
    >
      <form
        onSubmit={handleSubmit}
        data-testid="automation-interview-add-repository-modal"
        className="relative flex w-[520px] max-w-[90vw] max-h-[85vh] flex-col rounded-xl border border-[var(--oh-border)] bg-base-secondary"
      >
        <ModalCloseButton
          onClose={onClose}
          testId="automation-interview-add-repository-modal-close"
        />

        <header className="flex-shrink-0 px-6 pb-4 pt-6">
          <h2 className={cn("pr-6", modalTitleLgClassName)}>
            {t(I18nKey.AUTOMATIONS$INTERVIEW_REPO_ADD_MODAL_TITLE)}
          </h2>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 custom-scrollbar">
          <SettingsInput
            testId="automation-interview-add-repository-address"
            label={t(I18nKey.AUTOMATIONS$INTERVIEW_REPO_ADDRESS_LABEL)}
            type="text"
            value={address}
            onChange={setAddress}
            placeholder={t(I18nKey.SETTINGS$PLUGINS_SOURCE_PLACEHOLDER)}
            showRequiredTag
          />
        </div>

        <footer className="flex flex-shrink-0 justify-end gap-2 px-6 pb-6 pt-4">
          <BrandButton
            type="button"
            variant="secondary"
            onClick={onClose}
            testId="automation-interview-add-repository-modal-dismiss"
          >
            {t(I18nKey.BUTTON$CLOSE)}
          </BrandButton>
          <BrandButton
            type="submit"
            variant="primary"
            testId="automation-interview-add-repository-submit"
            isDisabled={!canSubmit}
          >
            {t(I18nKey.BUTTON$ADD)}
          </BrandButton>
        </footer>
      </form>
    </ModalBackdrop>
  );
}
