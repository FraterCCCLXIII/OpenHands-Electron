import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { IntegrationCatalogEntry as MarketplaceEntry } from "@openhands/extensions/integrations";
import { BrandButton } from "#/components/features/settings/brand-button";
import { InstallServerModal } from "#/components/features/mcp-page/install-server-modal";
import { useMissingCatalogIntegrations } from "#/hooks/query/use-missing-catalog-integrations";
import { I18nKey } from "#/i18n/declaration";
import {
  inferRequiredIntegrationIds,
  integrationHintsFromDraft,
  type AutomationCreateDraft,
} from "#/utils/automation-create-interview";
import { isMcpInstallableEntry } from "#/utils/mcp-marketplace-utils";

export const AUTOMATION_INTERVIEW_MISSING_INTEGRATIONS_TEST_ID =
  "automation-interview-missing-integrations";

export function useInterviewMissingIntegrations(
  draft: AutomationCreateDraft | undefined,
) {
  const requiredIds = useMemo(
    () =>
      draft
        ? inferRequiredIntegrationIds(integrationHintsFromDraft(draft))
        : [],
    [draft],
  );
  return useMissingCatalogIntegrations(requiredIds);
}

interface AutomationInterviewMissingIntegrationsProps {
  draft: AutomationCreateDraft;
}

export function AutomationInterviewMissingIntegrations({
  draft,
}: AutomationInterviewMissingIntegrationsProps) {
  const { t } = useTranslation("openhands");
  const { missing, installedServers } = useInterviewMissingIntegrations(draft);
  const [installEntry, setInstallEntry] = useState<MarketplaceEntry | null>(
    null,
  );

  if (missing.length === 0) return null;

  return (
    <div
      data-testid={AUTOMATION_INTERVIEW_MISSING_INTEGRATIONS_TEST_ID}
      className="w-full"
    >
      <div className="divide-y divide-[var(--oh-border-subtle)]">
        {missing.map((entry) => (
          <MissingIntegrationRow
            key={entry.id}
            entry={entry}
            connectLabel={t(I18nKey.AUTOMATIONS$INTERVIEW_INTEGRATIONS_CONNECT)}
            onConnect={setInstallEntry}
          />
        ))}
      </div>
      {installEntry ? (
        <InstallServerModal
          key={installEntry.id}
          entry={installEntry}
          existingServers={installedServers}
          onClose={() => setInstallEntry(null)}
          onSuccess={() => setInstallEntry(null)}
        />
      ) : null}
    </div>
  );
}

function MissingIntegrationRow({
  entry,
  connectLabel,
  onConnect,
}: {
  entry: MarketplaceEntry;
  connectLabel: string;
  onConnect: (entry: MarketplaceEntry) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2">
      <span className="text-sm text-content">{entry.name}</span>
      {isMcpInstallableEntry(entry) ? (
        <BrandButton
          type="button"
          variant="secondary"
          testId={`automation-missing-integration-connect-${entry.id}`}
          className="!h-7 !min-h-7 !px-2.5 !text-xs"
          onClick={() => onConnect(entry)}
        >
          {connectLabel}
        </BrandButton>
      ) : null}
    </div>
  );
}
