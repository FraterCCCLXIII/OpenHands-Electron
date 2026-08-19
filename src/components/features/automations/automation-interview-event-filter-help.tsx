import { useState, type MouseEvent } from "react";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useClickOutsideElement } from "#/hooks/use-click-outside-element";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

export function AutomationInterviewEventFilterHelp() {
  const { t } = useTranslation("openhands");
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);
  const containerRef = useClickOutsideElement<HTMLDivElement>(close);

  const stopLabelActivation = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        data-testid="automation-interview-draft-event-filter-help"
        aria-label={t(I18nKey.AUTOMATIONS$DETAIL$EVENT_FILTER_HELP_LABEL)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex size-4 items-center justify-center rounded-full text-[var(--oh-muted)] hover:text-[var(--oh-foreground)] transition-colors"
        onMouseDown={stopLabelActivation}
        onClick={(event) => {
          stopLabelActivation(event);
          setIsOpen((open) => !open);
        }}
      >
        <Info className="size-3.5" aria-hidden />
      </button>
      {isOpen ? (
        <div
          role="dialog"
          data-testid="automation-interview-draft-event-filter-help-popover"
          className={cn(
            "absolute left-0 top-full z-20 mt-1 w-[260px]",
            "rounded-md border border-[var(--oh-border-subtle)] bg-tertiary px-3 py-2 shadow-lg",
            "text-xs leading-relaxed text-[var(--oh-foreground)]",
          )}
        >
          {t(I18nKey.AUTOMATIONS$DETAIL$EVENT_FILTER_HELP)}
        </div>
      ) : null}
    </div>
  );
}
