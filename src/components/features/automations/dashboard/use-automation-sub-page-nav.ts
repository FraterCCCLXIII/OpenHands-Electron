import { LayoutDashboard, SquareKanban } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MANIFEST_ICON_BY_SLUG } from "#/components/features/manifest/manifest-icons";
import type { SubPageNavItem } from "#/components/features/manifest/manifest-subpage-layout";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { I18nKey } from "#/i18n/declaration";
import {
  automationListPath,
  automationWorkflowsPath,
  getInterfaceCopy,
  getSubPagesSpec,
  hasAutomationInterface,
} from "#/manifests/automation-interface";

export interface AutomationSubPageNav {
  heading: string;
  items: SubPageNavItem[];
}

/**
 * Automate sub-page navigation: manifest-declared tabs plus the host-owned
 * Workflows board. Returns null when the automation interface is not admitted.
 */
export function useAutomationSubPageNav(): AutomationSubPageNav | null {
  const { t } = useTranslation("openhands");
  const active = useActiveBackend();

  if (!hasAutomationInterface()) return null;

  const spec = getSubPagesSpec();
  const isCloudBackend = active.backend.kind === "cloud";
  const manifestItems: SubPageNavItem[] = spec
    ? spec
        .filter((item) => !(item.page === "templates" && isCloudBackend))
        .map((item) => ({
          to: item.to,
          label: item.label,
          Icon: MANIFEST_ICON_BY_SLUG[item.icon],
          testId: `automations-navigation-${item.page}`,
        }))
    : [
        {
          to: automationListPath(),
          label: getInterfaceCopy().listTitle,
          Icon: LayoutDashboard,
          testId: "automations-navigation-list",
        },
      ];

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
    heading: getInterfaceCopy().sidebarLabel,
    items,
  };
}
