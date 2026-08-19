import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nKey } from "#/i18n/declaration";
import { SkillCategoryChips } from "#/components/features/skills/skill-category-chips";
import type { SkillFacetGroup } from "#/components/features/skills/skill-filter";

function mockScrollMetrics(
  element: HTMLElement,
  metrics: { scrollWidth: number; clientWidth: number; scrollLeft: number },
) {
  Object.defineProperty(element, "scrollWidth", {
    configurable: true,
    value: metrics.scrollWidth,
  });
  Object.defineProperty(element, "clientWidth", {
    configurable: true,
    value: metrics.clientWidth,
  });
  Object.defineProperty(element, "scrollLeft", {
    configurable: true,
    writable: true,
    value: metrics.scrollLeft,
  });
}

function buildCategoryGroup(): SkillFacetGroup {
  return {
    id: "category",
    labelKey: I18nKey.SETTINGS$SKILLS_FACET_CATEGORY,
    rows: [
      {
        value: "environment",
        labelKey: I18nKey.SETTINGS$SKILLS_CATEGORY_ENVIRONMENT,
        count: 10,
        checked: false,
        disabled: false,
      },
      {
        value: "writing",
        labelKey: I18nKey.SETTINGS$SKILLS_CATEGORY_WRITING,
        count: 0,
        checked: false,
        disabled: true,
      },
    ],
  };
}

describe("SkillCategoryChips", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = vi.fn();

        unobserve = vi.fn();

        disconnect = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders nothing when the category group is missing", () => {
    render(<SkillCategoryChips group={undefined} onToggle={vi.fn()} />);
    expect(
      screen.queryByTestId("skill-category-chips"),
    ).not.toBeInTheDocument();
  });

  it("renders chips with counts and pressed state", () => {
    render(<SkillCategoryChips group={buildCategoryGroup()} onToggle={vi.fn()} />);

    const chip = screen.getByTestId("skill-facet-category-environment");
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(chip).toHaveTextContent("10");
    expect(screen.getByTestId("skill-category-chips")).toBeInTheDocument();
  });

  it("reports the value when a chip is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <SkillCategoryChips group={buildCategoryGroup()} onToggle={onToggle} />,
    );

    await user.click(screen.getByTestId("skill-facet-category-environment"));

    expect(onToggle).toHaveBeenCalledWith("environment");
  });

  it("does not report clicks on a disabled zero-count chip", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <SkillCategoryChips group={buildCategoryGroup()} onToggle={onToggle} />,
    );

    await user.click(screen.getByTestId("skill-facet-category-writing"));

    expect(onToggle).not.toHaveBeenCalled();
  });

  it("shows edge fades when the chip row overflows horizontally", () => {
    render(<SkillCategoryChips group={buildCategoryGroup()} onToggle={vi.fn()} />);

    const scroller = screen.getByTestId("skill-category-chips").parentElement!;
    const leftFade = screen.getByTestId("skill-category-chips-fade-left");
    const rightFade = screen.getByTestId("skill-category-chips-fade-right");

    mockScrollMetrics(scroller, {
      scrollWidth: 900,
      clientWidth: 320,
      scrollLeft: 0,
    });
    fireEvent.scroll(scroller);

    expect(rightFade).toHaveAttribute("data-visible", "true");
    expect(leftFade).toHaveAttribute("data-visible", "false");
  });
});
