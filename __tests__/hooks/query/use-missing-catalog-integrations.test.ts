import { describe, expect, it } from "vitest";
import { getMissingCatalogIntegrations } from "#/hooks/query/use-missing-catalog-integrations";

describe("getMissingCatalogIntegrations", () => {
  it("returns catalog entries that are not installed", () => {
    expect(
      getMissingCatalogIntegrations(["slack"], []).map((entry) => entry.id),
    ).toEqual(["slack"]);
  });

  it("ignores unknown catalog ids", () => {
    expect(getMissingCatalogIntegrations(["not-a-catalog-id"], [])).toEqual([]);
  });
});
