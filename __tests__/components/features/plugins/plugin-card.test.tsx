import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PluginCard } from "#/components/features/plugins/plugin-card";
import type { PluginViewModel } from "#/components/features/plugins/build-plugins-view-model";
import { I18nKey } from "#/i18n/declaration";

function buildPlugin(
  overrides: Partial<PluginViewModel> = {},
): PluginViewModel {
  return {
    name: "city-weather",
    description:
      "Get current weather, time, and precipitation forecast for any city.",
    source:
      "/Users/me/.openhands/cache/skills/public-skills/plugins/city-weather",
    ref: null,
    repoPath: null,
    installed: false,
    enabled: false,
    version: null,
    inCatalog: true,
    isLocal: false,
    path: null,
    skills: null,
    files: null,
    ...overrides,
  };
}

describe("PluginCard", () => {
  it("matches the skill card layout with icon, source path, and pills", () => {
    const source =
      "/Users/me/.openhands/cache/skills/public-skills/plugins/city-weather";

    render(
      <PluginCard
        plugin={buildPlugin({ source, version: "1.2.3", ref: "main" })}
        onOpen={vi.fn()}
        onInstall={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByTestId("plugin-icon-city-weather")).toBeInTheDocument();
    expect(screen.getByTestId("plugin-source-city-weather")).toHaveTextContent(
      source,
    );
    expect(
      screen.getByTestId("plugin-description-city-weather"),
    ).toHaveTextContent("Get current weather");
    expect(screen.getByTestId("plugin-version-city-weather")).toHaveTextContent(
      I18nKey.SETTINGS$SKILLS_VERSION,
    );
    expect(screen.getByTestId("plugin-ref-city-weather")).toHaveTextContent(
      "@main",
    );
    expect(
      screen.queryByTestId("plugin-pills-city-weather"),
    ).toBeInTheDocument();
  });

  it("renders a local badge in the pill row instead of the header", () => {
    render(
      <PluginCard
        plugin={buildPlugin({
          isLocal: true,
          source: null,
          path: "/home/me/.agents/plugins/city-weather",
          version: "1.0.0",
        })}
        onOpen={vi.fn()}
        onInstall={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("plugin-local-badge-city-weather"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("plugin-install-city-weather"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("plugin-toggle-city-weather"),
    ).not.toBeInTheDocument();
  });

  it("shows the install action for catalog plugins", () => {
    render(
      <PluginCard
        plugin={buildPlugin()}
        onOpen={vi.fn()}
        onInstall={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByTestId("plugin-install-city-weather")).toHaveAttribute(
      "aria-label",
      I18nKey.SETTINGS$PLUGINS_INSTALL,
    );
  });
});
