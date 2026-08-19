import type { SkillCategoryId } from "@openhands/extensions/skills";
import { useTranslation } from "react-i18next";
import { HorizontalScrollFade } from "#/components/shared/horizontal-scroll-fade";
import { cn } from "#/utils/utils";
import { SKILL_CATEGORY_ICONS } from "#/utils/skill-category";
import type { SkillFacetGroup } from "./skill-filter";

interface SkillCategoryChipsProps {
  group: SkillFacetGroup | undefined;
  onToggle: (value: string) => void;
  className?: string;
}

export function SkillCategoryChips({
  group,
  onToggle,
  className,
}: SkillCategoryChipsProps) {
  const { t } = useTranslation("openhands");

  if (!group || group.rows.length === 0) return null;

  return (
    <HorizontalScrollFade
      fadeTestIdPrefix="skill-category-chips-fade"
      className={className}
    >
      <div
        data-testid="skill-category-chips"
        role="group"
        aria-label={t(group.labelKey)}
        className="flex w-max min-w-full flex-nowrap gap-1.5"
      >
        {group.rows.map((row) => {
          const Icon = SKILL_CATEGORY_ICONS[row.value as SkillCategoryId];
          const label = t(row.labelKey);

          return (
            <button
              key={row.value}
              type="button"
              aria-pressed={row.checked}
              data-testid={`skill-facet-category-${row.value}`}
              disabled={row.disabled}
              onClick={() => onToggle(row.value)}
              title={label}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border-0 px-2.5 py-1 text-xs transition-colors",
                row.disabled
                  ? "cursor-default text-tertiary-alt/40"
                  : "cursor-pointer",
                row.checked
                  ? "bg-white text-black"
                  : !row.disabled &&
                      "bg-[rgba(255,255,255,0.04)] text-tertiary-light hover:bg-[var(--oh-surface-raised)] hover:text-white",
              )}
            >
              {Icon ? <Icon className="size-3 shrink-0" aria-hidden /> : null}
              <span className="whitespace-nowrap">{label}</span>
              <span
                className={cn(
                  "shrink-0 text-[10px]",
                  row.checked ? "text-black/60" : "text-tertiary-alt",
                )}
              >
                {row.count}
              </span>
            </button>
          );
        })}
      </div>
    </HorizontalScrollFade>
  );
}
