import {
  getPluginSourceLabel,
  isLocalPluginSource,
} from "#/utils/plugin-display";
import type { PluginViewModel } from "./build-plugins-view-model";

type PluginCardSourceFields = Pick<
  PluginViewModel,
  "source" | "ref" | "repoPath" | "isLocal" | "path"
>;

export function getPluginCardSourceLabel(
  plugin: PluginCardSourceFields,
): string | null {
  if (plugin.isLocal) {
    return plugin.path ?? null;
  }

  if (!plugin.source) {
    return null;
  }

  const spec = {
    source: plugin.source,
    ref: plugin.ref,
    repo_path: plugin.repoPath ?? undefined,
  };

  if (isLocalPluginSource(spec)) {
    return plugin.source;
  }

  return getPluginSourceLabel(spec);
}

export function getPluginCardSourceTitle(
  plugin: PluginCardSourceFields,
): string | undefined {
  if (plugin.isLocal && plugin.path) {
    return plugin.path;
  }

  if (!plugin.source) {
    return undefined;
  }

  return plugin.ref ? `${plugin.source} @ ${plugin.ref}` : plugin.source;
}
