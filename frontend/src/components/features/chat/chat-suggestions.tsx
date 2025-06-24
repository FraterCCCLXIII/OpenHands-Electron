import { useTranslation } from "react-i18next";
import { Suggestions } from "#/components/features/suggestions/suggestions";
import { I18nKey } from "#/i18n/declaration";
import BuildIt from "#/icons/build-it.svg?react";
import { SUGGESTIONS } from "#/utils/suggestions";

interface ChatSuggestionsProps {
  onSuggestionsClick: (value: string) => void;
  isRightPanelVisible?: boolean;
}

export function ChatSuggestions({ onSuggestionsClick, isRightPanelVisible = true }: ChatSuggestionsProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col gap-6 h-full px-4 items-center justify-center ${!isRightPanelVisible ? 'max-w-[700px] mx-auto' : ''}`}>
      <div className="flex flex-col items-center p-4 rounded-xl w-full">
        <BuildIt width={60} height={72} className="animate-wave mb-8" />
        <span className="font-semibold text-[20px] leading-6 -tracking-[0.01em] gap-1">
          {t(I18nKey.LANDING$TITLE)}
        </span>
      </div>
      <Suggestions
        suggestions={Object.entries(SUGGESTIONS.repo)
          .slice(0, 4)
          .map(([label, value]) => ({
            label,
            value,
          }))}
        onSuggestionClick={onSuggestionsClick}
      />
    </div>
  );
}
