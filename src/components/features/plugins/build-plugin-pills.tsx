import type { TFunction } from "i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { extensionModuleCardPillClassName } from "#/utils/extension-module-card-classes";
import type { SkillCardPill } from "#/components/features/skills/skill-card-pill-row";
import type { PluginViewModel } from "./build-plugins-view-model";

export function buildPluginPills(
  plugin: PluginViewModel,
  translate: TFunction,
): SkillCardPill[] {
  const pills: SkillCardPill[] = [];

  if (plugin.isLocal) {
    pills.push({
      id: "local",
      node: (
        <span
          data-testid={`plugin-local-badge-${plugin.name}`}
          className={extensionModuleCardPillClassName}
        >
          {translate(I18nKey.SETTINGS$PLUGINS_FILTER_LOCAL)}
        </span>
      ),
    });
  }

  if (plugin.ref) {
    pills.push({
      id: `ref-${plugin.ref}`,
      node: (
        <span
          data-testid={`plugin-ref-${plugin.name}`}
          className={cn(extensionModuleCardPillClassName, "font-medium")}
        >
          @{plugin.ref}
        </span>
      ),
    });
  }

  if (plugin.repoPath) {
    pills.push({
      id: `repo-${plugin.repoPath}`,
      node: (
        <span
          data-testid={`plugin-repo-path-${plugin.name}`}
          className={extensionModuleCardPillClassName}
        >
          {plugin.repoPath}
        </span>
      ),
    });
  }

  return pills;
}
