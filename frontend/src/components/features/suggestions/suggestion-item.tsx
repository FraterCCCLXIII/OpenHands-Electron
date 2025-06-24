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

  // Map suggestion labels to icons and colors
  const getIconAndColor = (label: string) => {
    const labelText = t(label as I18nKey);
    if (labelText.includes("test") || labelText.includes("coverage")) {
      return {
        icon: <TestTube className="w-4 h-4" />,
        color: "text-blue-500"
      };
    }
    if (labelText.includes("PR") || labelText.includes("merge")) {
      return {
        icon: <GitPullRequest className="w-4 h-4" />,
        color: "text-green-500"
      };
    }
    if (labelText.includes("README")) {
      return {
        icon: <FileText className="w-4 h-4" />,
        color: "text-purple-500"
      };
    }
    if (labelText.includes("dependenc")) {
      return {
        icon: <Package className="w-4 h-4" />,
        color: "text-orange-500"
      };
    }
    return {
      icon: null,
      color: "text-primary"
    };
  };

  const { icon, color } = getIconAndColor(suggestion.label);

  return (
    <li className="list-none border border-border rounded-xl hover:bg-tertiary flex-1">
      <button
        type="button"
        data-testid="suggestion"
        onClick={() => onClick(suggestion.value)}
        className="text-xs leading-5 tracking-tight text-center w-full p-3 font-normal flex items-center justify-center gap-2"
      >
        <span className={color}>
          {icon}
        </span>
        {t(suggestion.label)}
      </button>
    </li>
  );
}
