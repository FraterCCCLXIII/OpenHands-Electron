import { useMemo } from "react";
import {
  INTEGRATION_CATALOG as MCP_MARKETPLACE,
  type IntegrationCatalogEntry as MarketplaceEntry,
} from "@openhands/extensions/integrations";
import {
  findInstalledEntryMatch,
  getMarketplaceEntryById,
} from "#/utils/mcp-marketplace-utils";
import { flattenMcpConfig } from "#/utils/mcp-installed-servers";
import { parseMcpConfig } from "#/utils/mcp-config";
import type { MCPServerConfig } from "#/types/mcp-server";
import { useSettings } from "./use-settings";

export function getMissingCatalogIntegrations(
  ids: string[],
  installedServers: MCPServerConfig[],
): MarketplaceEntry[] {
  return ids
    .map((id) => getMarketplaceEntryById(id, MCP_MARKETPLACE))
    .filter((entry): entry is MarketplaceEntry => !!entry)
    .filter((entry) => !findInstalledEntryMatch(entry, installedServers));
}

export function useMissingCatalogIntegrations(ids: string[]) {
  const { data: settings, isLoading } = useSettings();

  const installedServers = useMemo(
    () =>
      flattenMcpConfig(
        settings?.mcp_config ??
          parseMcpConfig(settings?.agent_settings?.mcp_config),
      ).filter((server) => server.enabled !== false),
    [settings?.agent_settings?.mcp_config, settings?.mcp_config],
  );

  const missing = useMemo(
    () => getMissingCatalogIntegrations(ids, installedServers),
    [ids, installedServers],
  );

  return { missing, installedServers, isLoading };
}
