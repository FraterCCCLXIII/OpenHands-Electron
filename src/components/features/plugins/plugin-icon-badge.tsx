import PluginCubeIcon from "#/icons/u-puzzle-piece.svg?react";
import { cn } from "#/utils/utils";

interface PluginIconBadgeProps {
  pluginName: string;
  className?: string;
}

export function PluginIconBadge({
  pluginName,
  className,
}: PluginIconBadgeProps) {
  return (
    <span
      aria-hidden="true"
      title={pluginName}
      data-testid={`plugin-icon-${pluginName}`}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden",
        "rounded-lg border border-white/10 bg-surface-raised text-white",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
        "[&>svg]:h-5 [&>svg]:w-5",
        className,
      )}
    >
      <PluginCubeIcon />
    </span>
  );
}
