import { SquareKanban } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MANIFEST_ICON_BY_SLUG } from "#/components/features/manifest/manifest-icons";
import type { SubPageNavItem } from "#/components/features/manifest/manifest-subpage-layout";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { I18nKey } from "#/i18n/declaration";
import {
  automationWorkflowsPath,
  getInterfaceCopy,
  getSubPagesSpec,
} from "#/manifests/automation-interface";

export interface AutomationSubPageNav {
  heading: string;
  items: SubPageNavItem[];
}

/**
 * Manifest sub-page navigation plus the host-owned Workflows tab.
 */
export function useAutomationSubPageNav(): AutomationSubPageNav | null {
  const { t } = useTranslation("openhands");
  const active = useActiveBackend();
  const spec = getSubPagesSpec();
  if (!spec) return null;

  const isCloudBackend = active.backend.kind === "cloud";
  const manifestItems: SubPageNavItem[] = spec
    .filter((item) => !(item.page === "templates" && isCloudBackend))
    .map((item) => ({
      to: item.to,
      label: item.label,
      Icon:
        item.page === "templates"
          ? MANIFEST_ICON_BY_SLUG.library
          : MANIFEST_ICON_BY_SLUG[item.icon],
      testId: `automations-navigation-${item.page}`,
    }));

  const workflowsPath = automationWorkflowsPath();
  const items = manifestItems.some((item) => item.to === workflowsPath)
    ? manifestItems
    : [
        ...manifestItems,
        {
          to: workflowsPath,
          label: t(I18nKey.WORKFLOWS$TITLE),
          Icon: SquareKanban,
          testId: "automations-navigation-workflows",
        },
      ];

  return {
    heading: getInterfaceCopy().sidebarLabel ?? t(I18nKey.SIDEBAR$AUTOMATIONS),
    items,
  };
}
