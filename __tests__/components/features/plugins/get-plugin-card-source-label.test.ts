import { describe, expect, it } from "vitest";
import {
  getPluginCardSourceLabel,
  getPluginCardSourceTitle,
} from "#/components/features/plugins/get-plugin-card-source-label";
import type { PluginViewModel } from "#/components/features/plugins/build-plugins-view-model";

function buildPlugin(
  overrides: Partial<PluginViewModel> = {},
): PluginViewModel {
  return {
    name: "demo-plugin",
    description: null,
    source: null,
    ref: null,
    repoPath: null,
    installed: false,
    enabled: false,
    version: null,
    inCatalog: false,
    isLocal: false,
    path: null,
    skills: null,
    files: null,
    ...overrides,
  };
}

describe("getPluginCardSourceLabel", () => {
  it("shows the full filesystem source path", () => {
    const source =
      "/Users/me/.openhands/cache/skills/public-skills/plugins/city-weather";

    expect(
      getPluginCardSourceLabel(
        buildPlugin({
          source,
        }),
      ),
    ).toBe(source);
  });

  it("formats github sources without the github: prefix", () => {
    expect(
      getPluginCardSourceLabel(
        buildPlugin({
          source: "github:OpenHands/extensions",
          ref: "main",
        }),
      ),
    ).toBe("OpenHands/extensions @ main");
  });

  it("uses the local plugin path for ambient plugins", () => {
    expect(
      getPluginCardSourceLabel(
        buildPlugin({
          isLocal: true,
          path: "/home/me/.agents/plugins/ambient-plugin",
        }),
      ),
    ).toBe("/home/me/.agents/plugins/ambient-plugin");
  });
});

describe("getPluginCardSourceTitle", () => {
  it("keeps the full source path available as a tooltip title", () => {
    const source =
      "/Users/me/.openhands/cache/skills/public-skills/plugins/city-weather";

    expect(
      getPluginCardSourceTitle(
        buildPlugin({
          source,
        }),
      ),
    ).toBe(source);
  });
});
