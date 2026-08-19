import { useTranslation } from "react-i18next";
import { useNavigation } from "#/context/navigation-context";
import { I18nKey } from "#/i18n/declaration";
import type { AutomationCreateDraft } from "#/utils/automation-create-interview";
import {
  extensionModuleCardInteractiveClassName,
  extensionModuleCardPillClassName,
  extensionModuleCardSurfaceClassName,
} from "#/utils/extension-module-card-classes";
import { cn } from "#/utils/utils";
import { StatusBadge } from "./status-badge";

interface AutomationInterviewDraftsProps {
  drafts: AutomationCreateDraft[];
}

export function AutomationInterviewDrafts({
  drafts,
}: AutomationInterviewDraftsProps) {
  const { t } = useTranslation("openhands");
  const { navigate } = useNavigation();

  if (drafts.length === 0) return null;

  return (
    <section data-testid="automation-interview-drafts" className="mt-6">
      <div className="flex items-center">
        <h2 className="text-base font-semibold text-foreground">
          {t(I18nKey.AUTOMATIONS$INTERVIEW_DRAFTS_TITLE)}
        </h2>
        <StatusBadge count={drafts.length} />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {drafts.map((draft) => {
          const title =
            draft.name.trim() || t(I18nKey.AUTOMATIONS$INTERVIEW_DRAWER_TITLE);

          return (
            <button
              key={draft.conversationId}
              type="button"
              data-testid={`automation-interview-draft-${draft.conversationId}`}
              className={cn(
                extensionModuleCardSurfaceClassName,
                extensionModuleCardInteractiveClassName,
                "flex w-full items-center justify-between gap-3 px-4 py-3 text-left",
              )}
              onClick={() =>
                navigate?.(`/conversations/${draft.conversationId}`)
              }
            >
              <span className="min-w-0 truncate text-sm font-medium text-content">
                {title}
              </span>
              <span className={extensionModuleCardPillClassName}>
                {t(I18nKey.AUTOMATIONS$INTERVIEW_DRAFT_BADGE)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
