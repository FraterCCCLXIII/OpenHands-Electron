import React from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import CopyIcon from "#/icons/copy.svg?react";
import CheckmarkIcon from "#/icons/checkmark.svg?react";
import { CirclePlusCheckToggle } from "#/components/shared/buttons/circle-plus-check-toggle";
import { CircleInstallButton } from "#/components/shared/buttons/circle-install-button";
import { SkillCardPillRow } from "#/components/features/skills/skill-card-pill-row";
import { isCopyableSkillSource } from "#/components/features/skills/is-copyable-skill-source";
import {
  extensionModuleCardInteractiveClassName,
  extensionModuleCardPillClassName,
  extensionModuleCardSurfaceClassName,
} from "#/utils/extension-module-card-classes";
import type { PluginViewModel } from "./build-plugins-view-model";
import { buildPluginPills } from "./build-plugin-pills";
import {
  getPluginCardSourceLabel,
  getPluginCardSourceTitle,
} from "./get-plugin-card-source-label";
import { PluginIconBadge } from "./plugin-icon-badge";

interface PluginCardProps {
  plugin: PluginViewModel;
  /** A mutation targeting this plugin is in flight. */
  isBusy?: boolean;
  /** Management actions are unavailable (e.g. non-local backend). */
  isDisabled?: boolean;
  onOpen: () => void;
  onInstall: () => void;
  onToggle: (enabled: boolean) => void;
}

export function PluginCard({
  plugin,
  isBusy = false,
  isDisabled = false,
  onOpen,
  onInstall,
  onToggle,
}: PluginCardProps) {
  const { t } = useTranslation("openhands");
  const [sourceCopied, setSourceCopied] = React.useState(false);

  const sourceLabel = getPluginCardSourceLabel(plugin);
  const sourceTitle = getPluginCardSourceTitle(plugin);
  const showCopySource = isCopyableSkillSource(plugin.source);
  const pills = React.useMemo(() => buildPluginPills(plugin, t), [plugin, t]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  const handleCopySource = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!plugin.source) {
      return;
    }

    await navigator.clipboard.writeText(plugin.source);
    setSourceCopied(true);
  };

  React.useEffect(() => {
    if (!sourceCopied) {
      return undefined;
    }

    const timeout = setTimeout(() => setSourceCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [sourceCopied]);

  const headerAction = plugin.installed ? (
    <CirclePlusCheckToggle
      testId={`plugin-toggle-${plugin.name}`}
      isSelected={plugin.enabled}
      isDisabled={isDisabled || isBusy}
      onToggle={onToggle}
      enableLabelKey={I18nKey.SETTINGS$PLUGINS_ENABLE_PLUGIN}
      disableLabelKey={I18nKey.SETTINGS$PLUGINS_DISABLE_PLUGIN}
      enableTooltipKey={I18nKey.COMMON$ENABLE}
      disableTooltipKey={I18nKey.COMMON$DISABLE}
    />
  ) : plugin.isLocal ? null : (
    <CircleInstallButton
      testId={`plugin-install-${plugin.name}`}
      isDisabled={isDisabled || isBusy}
      onInstall={onInstall}
      labelKey={
        isBusy
          ? I18nKey.SETTINGS$PLUGINS_INSTALLING
          : I18nKey.SETTINGS$PLUGINS_INSTALL
      }
      tooltipKey={
        isBusy
          ? I18nKey.SETTINGS$PLUGINS_INSTALLING
          : I18nKey.SETTINGS$PLUGINS_INSTALL
      }
    />
  );

  return (
    <div
      data-testid={`plugin-card-${plugin.name}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex min-w-0 flex-col gap-3 overflow-hidden p-4",
        extensionModuleCardSurfaceClassName,
        extensionModuleCardInteractiveClassName,
      )}
    >
      <div className="flex items-start gap-3">
        <PluginIconBadge pluginName={plugin.name} />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <header className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h3
                  data-testid={`plugin-name-${plugin.name}`}
                  className="min-w-0 truncate text-sm font-semibold text-white"
                >
                  {plugin.name}
                </h3>
                {plugin.version ? (
                  <span
                    data-testid={`plugin-version-${plugin.name}`}
                    className={cn(extensionModuleCardPillClassName, "border-0")}
                  >
                    {t(I18nKey.SETTINGS$SKILLS_VERSION, {
                      version: plugin.version,
                    })}
                  </span>
                ) : null}
              </div>
              {sourceLabel ? (
                <div className="mt-0.5 flex min-w-0 items-center gap-1">
                  <p
                    data-testid={`plugin-source-${plugin.name}`}
                    className="min-w-0 flex-1 truncate text-xs text-tertiary-alt"
                    title={sourceTitle}
                  >
                    {sourceLabel}
                  </p>
                  {showCopySource ? (
                    <button
                      type="button"
                      data-testid={`plugin-copy-source-${plugin.name}`}
                      aria-label={t(
                        sourceCopied
                          ? I18nKey.BUTTON$COPIED
                          : I18nKey.SETTINGS$SKILLS_COPY_PATH,
                      )}
                      disabled={sourceCopied}
                      onClick={handleCopySource}
                      className="shrink-0 cursor-pointer border-0 bg-transparent p-0.5 text-tertiary-alt hover:text-white disabled:cursor-default [&_path]:fill-current"
                    >
                      {sourceCopied ? (
                        <CheckmarkIcon width={12} height={12} />
                      ) : (
                        <CopyIcon width={12} height={12} />
                      )}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            {headerAction}
          </header>

          {plugin.description ? (
            <div
              data-testid={`plugin-description-${plugin.name}`}
              className="min-w-0"
            >
              <p className="line-clamp-2 break-words text-xs leading-relaxed text-tertiary-light">
                {plugin.description}
              </p>
            </div>
          ) : null}

          {pills.length > 0 ? (
            <SkillCardPillRow
              pills={pills}
              testId={`plugin-pills-${plugin.name}`}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
