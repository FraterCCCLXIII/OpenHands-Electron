import { I18nKey } from "#/i18n/declaration";
import { EnumFilterDropdown } from "#/components/shared/filters/enum-filter-dropdown";
import type { PluginStatusFilter } from "./build-plugins-view-model";

export const PLUGIN_STATUS_FILTER_OPTIONS: PluginStatusFilter[] = [
  "all",
  "installed",
  "available",
  "local",
];

const FILTER_LABEL_KEY: Record<PluginStatusFilter, I18nKey> = {
  all: I18nKey.SETTINGS$PLUGINS_FILTER_ALL,
  installed: I18nKey.SETTINGS$PLUGINS_FILTER_INSTALLED,
  available: I18nKey.SETTINGS$PLUGINS_FILTER_AVAILABLE,
  local: I18nKey.SETTINGS$PLUGINS_FILTER_LOCAL,
};

interface PluginsStatusFilterDropdownProps {
  value: PluginStatusFilter;
  onChange: (filter: PluginStatusFilter) => void;
}

export function PluginsStatusFilterDropdown({
  value,
  onChange,
}: PluginsStatusFilterDropdownProps) {
  return (
    <EnumFilterDropdown
      testId="plugins-status-filter"
      value={value}
      onChange={onChange}
      options={PLUGIN_STATUS_FILTER_OPTIONS}
      labelKeyByValue={FILTER_LABEL_KEY}
    />
  );
}
