import React from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { getRandomTip } from "#/utils/tips";
import { X } from "lucide-react";
import { Button } from "#/components/ui/button";

export function EnhancedProTip() {
  const { t } = useTranslation();
  const [randomTip, setRandomTip] = React.useState(getRandomTip());
  const [isVisible, setIsVisible] = React.useState(true);

  // Update the random tip when the component mounts
  React.useEffect(() => {
    setRandomTip(getRandomTip());
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="max-w-2xl mb-4 text-m bg-tertiary rounded-xl p-4 text-left mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* White tip icon */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
          </div>

          <div className="flex-1">
            <h4 className="font-bold text-content mb-1">{t(I18nKey.TIPS$PROTIP)}</h4>
            <p className="text-content-secondary">
              {t(randomTip.key)}
              {randomTip.link && (
                <>
                  {" "}
                  <a
                    href={randomTip.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-primary hover:text-primary/80 transition-colors"
                  >
                    {t(I18nKey.TIPS$LEARN_MORE)}
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Dismiss X button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="flex-shrink-0 text-content-secondary hover:text-content transition-colors p-1"
          aria-label="Dismiss tip"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
