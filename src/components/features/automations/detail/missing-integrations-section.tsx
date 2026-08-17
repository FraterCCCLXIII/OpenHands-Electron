import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ExclamationCircleIcon from "#/icons/exclamation-circle.svg?react";
import { MissingIntegrationsBanner } from "#/components/features/automations/missing-integrations-banner";
import { useMissingCatalogIntegrations } from "#/hooks/query/use-missing-catalog-integrations";
import { I18nKey } from "#/i18n/declaration";
import type { Automation } from "#/types/automation";
import {
  inferRequiredIntegrationIds,
  integrationHintsFromAutomation,
} from "#/utils/automation-create-interview";

interface MissingIntegrationsSectionProps {
  automation: Automation;
}

export function MissingIntegrationsSection({
  automation,
}: MissingIntegrationsSectionProps) {
  const { t } = useTranslation("openhands");
  const requiredIds = useMemo(
    () =>
      inferRequiredIntegrationIds(integrationHintsFromAutomation(automation)),
    [automation],
  );
  const { missing, installedServers, isLoading } =
    useMissingCatalogIntegrations(requiredIds);

  if (isLoading || missing.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-[var(--oh-warning)]/50 bg-[var(--oh-warning)]/10 px-5 py-5"
      data-testid="automation-missing-integrations"
    >
      <div className="mb-3 flex items-center gap-2">
        <ExclamationCircleIcon className="size-4 text-[var(--oh-warning)]" />
        <h3 className="text-sm font-medium text-content">
          {t(I18nKey.AUTOMATIONS$DETAIL$INTEGRATIONS_TITLE)}
        </h3>
      </div>
      <MissingIntegrationsBanner
        missing={missing}
        installedServers={installedServers}
        message={t(I18nKey.AUTOMATIONS$DETAIL$INTEGRATIONS_MISSING)}
      />
    </section>
  );
}
