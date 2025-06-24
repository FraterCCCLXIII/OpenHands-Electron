import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { TestTube, GitPullRequest, FileText, Package } from "lucide-react";

export type Suggestion = { label: I18nKey | string; value: string };

interface SuggestionItemProps {
  suggestion: Suggestion;
  onClick: (value: string) => void;
}

export function SuggestionItem({ suggestion, onClick }: SuggestionItemProps) {
  const { t } = useTranslation();

  // Map suggestion labels to icons
  const getIcon = (label: string) => {
    const labelText = t(label as I18nKey);
    if (labelText.includes("test") || labelText.includes("coverage")) {
      return <TestTube className="w-4 h-4" />;
    }
    if (labelText.includes("PR") || labelText.includes("merge")) {
      return <GitPullRequest className="w-4 h-4" />;
    }
    if (labelText.includes("README")) {
      return <FileText className="w-4 h-4" />;
    }
    if (labelText.includes("dependenc")) {
      return <Package className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <li className="list-none border border-border rounded-xl hover:bg-tertiary flex-1">
      <button
        type="button"
        data-testid="suggestion"
        onClick={() => onClick(suggestion.value)}
        className="text-[16px] leading-6 -tracking-[0.01em] text-center w-full p-3 font-semibold flex items-center justify-center gap-2"
      >
        {getIcon(suggestion.label)}
        {t(suggestion.label)}
      </button>
    </li>
  );
}
