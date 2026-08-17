import {
  INTEGRATION_CATALOG,
  type IntegrationCatalogEntry,
} from "@openhands/extensions/integrations";

/**
 * Bare tokens that are also ordinary English (or weekday) words.
 * Still required when the agent declares them or they are the event source.
 */
const AMBIGUOUS_BARE_IDS = new Set(["linear", "monday", "box"]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasWholePhrase(haystack: string, phrase: string): boolean {
  const trimmed = phrase.trim();
  if (!trimmed) return false;
  const pattern = escapeRegExp(trimmed).replace(/\s+/g, "\\s+");
  return new RegExp(`\\b${pattern}\\b`, "i").test(haystack);
}

function textMatchTerms(entry: IntegrationCatalogEntry): string[] {
  const terms: string[] = [];
  const spacedId = entry.id.replace(/-/g, " ");
  if (!AMBIGUOUS_BARE_IDS.has(entry.id)) {
    terms.push(entry.id);
    if (spacedId !== entry.id) terms.push(spacedId);
  }

  const name = entry.name.trim();
  const nameWithoutCom = name.replace(/\.com$/i, "");
  const nameIsBareAmbiguous =
    AMBIGUOUS_BARE_IDS.has(entry.id) &&
    nameWithoutCom.toLowerCase() === entry.id;
  if (!nameIsBareAmbiguous || /\./.test(name)) {
    terms.push(name);
  }

  return terms;
}

/** Catalog ids whose name or id appears as a whole phrase in `text`. */
export function matchCatalogIntegrationIds(text: string): string[] {
  if (!text.trim()) return [];
  return INTEGRATION_CATALOG.filter((entry) =>
    textMatchTerms(entry).some((term) => hasWholePhrase(text, term)),
  ).map((entry) => entry.id);
}

export function sanitizeCatalogIntegrationIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const known = new Set(INTEGRATION_CATALOG.map((entry) => entry.id));
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (!known.has(id) || ids.includes(id)) continue;
    ids.push(id);
  }
  return ids;
}
