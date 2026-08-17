import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { IntegrationCatalogEntry as MarketplaceEntry } from "@openhands/extensions/integrations";
import { BrandButton } from "#/components/features/settings/brand-button";
import { InstallServerModal } from "#/components/features/mcp-page/install-server-modal";
import { NavigationLink } from "#/components/shared/navigation-link";
import { I18nKey } from "#/i18n/declaration";
import type { MCPServerConfig } from "#/types/mcp-server";
import { isMcpInstallableEntry } from "#/utils/mcp-marketplace-utils";

interface MissingIntegrationsBannerProps {
  missing: MarketplaceEntry[];
  installedServers: MCPServerConfig[];
  message: string;
  testId?: string;
}

export function MissingIntegrationsBanner({
  missing,
  installedServers,
  message,
  testId,
}: MissingIntegrationsBannerProps) {
  const { t } = useTranslation("openhands");
  const [installEntry, setInstallEntry] = useState<MarketplaceEntry | null>(
    null,
  );

  if (missing.length === 0) return null;

  return (
    <div className="space-y-2" data-testid={testId}>
      <p className="text-sm text-content">{message}</p>
      {missing.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between gap-2">
          <span className="text-sm text-content">{entry.name}</span>
          {isMcpInstallableEntry(entry) ? (
            <BrandButton
              type="button"
              variant="secondary"
              testId={`automation-missing-integration-connect-${entry.id}`}
              onClick={() => setInstallEntry(entry)}
            >
              {t(I18nKey.AUTOMATIONS$INTERVIEW_INTEGRATIONS_CONNECT)}
            </BrandButton>
          ) : null}
        </div>
      ))}
      <NavigationLink
        to="/mcp"
        className="text-xs underline text-[var(--oh-text-tertiary)]"
      >
        {t(I18nKey.SETUP$MANAGE_INTEGRATIONS)}
      </NavigationLink>
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
