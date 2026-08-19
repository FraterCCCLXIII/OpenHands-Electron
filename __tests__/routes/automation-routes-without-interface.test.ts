import { describe, expect, it, vi } from "vitest";

/**
 * Without an admitted interface manifest the list page still renders via host
 * defaults. Detail, setup, and templates routes remain manifest-gated and 404.
 */
vi.mock("#/manifests/manifest-sources", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("#/manifests/manifest-sources")>();
  return { ...actual, AUTOMATION_INTERFACE_CANDIDATE: undefined };
});

function statusOfLoader(load: () => unknown): number | null {
  try {
    load();
  } catch (error) {
    return error instanceof Response ? error.status : null;
  }
  return null;
}

describe("the automation routes without an admitted interface manifest", () => {
  it("404s manifest-gated routes but not the list page", async () => {
    // Arrange
    const [list, detail, setup, templates] = await Promise.all([
      import("#/routes/automations-list"),
      import("#/routes/automation-detail"),
      import("#/routes/automation-setup-route"),
      import("#/routes/automation-templates"),
    ]);

    // Act & Assert
    expect({
      listHasClientLoader: "clientLoader" in list,
      detail: statusOfLoader(() => detail.clientLoader()),
      setup: statusOfLoader(() =>
        setup.clientLoader({
          params: { automationId: "github-pr-reviewer" },
        } as Parameters<typeof setup.clientLoader>[0]),
      ),
      templates: statusOfLoader(() => templates.clientLoader()),
    }).toEqual({
      listHasClientLoader: false,
      detail: 404,
      setup: 404,
      templates: 404,
    });
  });
});
