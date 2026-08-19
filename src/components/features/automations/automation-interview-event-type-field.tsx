import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useClickOutsideElement } from "#/hooks/use-click-outside-element";
import { I18nKey } from "#/i18n/declaration";
import {
  AUTOMATION_EVENT_OPTIONS,
  type AutomationEventOption,
} from "#/utils/automation-create-interview";
import { extensionModuleCardPillClassName } from "#/utils/extension-module-card-classes";
import {
  dropdownMenuListClassName,
  dropdownMenuRowClassName,
} from "#/utils/dropdown-classes";
import {
  formControlBorderClassName,
  formControlFocusWithinClassName,
  formControlHeightClassName,
  formControlRadiusClassName,
  formControlSurfaceClassName,
} from "#/utils/form-control-classes";
import { cn } from "#/utils/utils";

export const EVENT_TYPE_LABELS: Record<AutomationEventOption, I18nKey> = {
  "pull_request.opened": I18nKey.AUTOMATIONS$INTERVIEW_EVENT_PR_OPENED,
  "pull_request.updated": I18nKey.AUTOMATIONS$INTERVIEW_EVENT_PR_UPDATED,
  "pull_request.ready_for_review": I18nKey.AUTOMATIONS$INTERVIEW_EVENT_PR_READY,
  "issues.opened": I18nKey.AUTOMATIONS$INTERVIEW_EVENT_ISSUE_OPENED,
  push: I18nKey.AUTOMATIONS$INTERVIEW_EVENT_PUSH,
};

interface AutomationInterviewEventTypeFieldProps {
  selectedEvents: string[];
  onChange: (events: string[]) => void;
}

export function AutomationInterviewEventTypeField({
  selectedEvents,
  onChange,
}: AutomationInterviewEventTypeFieldProps) {
  const { t } = useTranslation("openhands");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useClickOutsideElement<HTMLDivElement>(() =>
    setIsMenuOpen(false),
  );

  const selected = selectedEvents.filter(
    (event): event is AutomationEventOption =>
      AUTOMATION_EVENT_OPTIONS.includes(event as AutomationEventOption),
  );
  const available = AUTOMATION_EVENT_OPTIONS.filter(
    (event) => !selected.includes(event),
  );

  const addEvent = (event: AutomationEventOption) => {
    onChange([...selected, event]);
    setIsMenuOpen(false);
  };

  const removeEvent = (event: AutomationEventOption) => {
    onChange(selected.filter((item) => item !== event));
  };

  const addLabel = `${t(I18nKey.BUTTON$ADD)} ${t(I18nKey.AUTOMATIONS$DETAIL$EVENT_TYPE)}`;

  return (
    <div className="flex flex-col gap-2.5 w-full min-w-0">
      <span className="text-sm">
        {t(I18nKey.AUTOMATIONS$DETAIL$EVENT_TYPE)}
      </span>
      <div
        ref={containerRef}
        data-testid="automation-interview-draft-events"
        className={cn(
          formControlHeightClassName,
          formControlRadiusClassName,
          formControlBorderClassName,
          formControlSurfaceClassName,
          formControlFocusWithinClassName,
          "flex w-full min-w-0 items-center gap-1 overflow-x-auto px-2",
        )}
      >
        {selected.map((event) => {
          const label = t(EVENT_TYPE_LABELS[event]);
          return (
            <span
              key={event}
              data-testid={`automation-interview-draft-event-${event}`}
              className={cn(extensionModuleCardPillClassName, "gap-1 pr-1")}
            >
              {label}
              <button
                type="button"
                data-testid={`automation-interview-draft-event-remove-${event}`}
                aria-label={`${t(I18nKey.COMMON$REMOVE)} ${label}`}
                className="inline-flex size-4 items-center justify-center rounded-full text-tertiary-light hover:bg-white/10 hover:text-white"
                onClick={() => removeEvent(event)}
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          );
        })}
        {available.length > 0 ? (
          <div className="relative">
            <button
              type="button"
              data-testid="automation-interview-draft-event-add"
              aria-label={addLabel}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-[var(--oh-muted)] hover:bg-white/10 hover:text-white"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <Plus className="size-4" aria-hidden />
            </button>
            {isMenuOpen ? (
              <div
                role="menu"
                data-testid="automation-interview-draft-event-menu"
                aria-label={addLabel}
                className={cn(
                  "absolute left-0 top-full z-50 mt-1 min-w-48 w-max",
                  "max-h-60 overflow-auto rounded-[6px] bg-tertiary p-1 context-menu-box-shadow",
                  dropdownMenuListClassName,
                )}
              >
                {available.map((event) => (
                  <button
                    key={event}
                    type="button"
                    role="menuitem"
                    data-testid={`automation-interview-draft-event-option-${event}`}
                    className={dropdownMenuRowClassName}
                    onClick={() => addEvent(event)}
                  >
                    {t(EVENT_TYPE_LABELS[event])}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
