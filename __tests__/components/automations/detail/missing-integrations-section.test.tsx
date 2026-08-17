import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MissingIntegrationsSection } from "#/components/features/automations/detail/missing-integrations-section";
import {
  NavigationProvider,
  type NavigationContextValue,
} from "#/context/navigation-context";
import { I18nKey } from "#/i18n/declaration";
import type { Automation } from "#/types/automation";

const useMissingCatalogIntegrations = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("#/hooks/query/use-missing-catalog-integrations", () => ({
  useMissingCatalogIntegrations: (...args: unknown[]) =>
    useMissingCatalogIntegrations(...args),
}));

const slackAutomation: Automation = {
  id: "auto-1",
  name: "Standup digest",
  prompt: "Post a standup digest to Slack",
  trigger: { type: "schedule", schedule_human: "Weekdays" },
  enabled: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function renderSection(automation: Automation = slackAutomation) {
  const navigation: NavigationContextValue = {
    currentPath: "/automations/auto-1",
    conversationId: null,
    isNavigating: false,
    navigate: vi.fn(),
  };

  return render(
    <NavigationProvider value={navigation}>
      <MissingIntegrationsSection automation={automation} />
    </NavigationProvider>,
  );
}

describe("MissingIntegrationsSection", () => {
  beforeEach(() => {
    useMissingCatalogIntegrations.mockReset();
    useMissingCatalogIntegrations.mockReturnValue({
      missing: [],
      installedServers: [],
      isLoading: false,
    });
  });

  it("asks the hook for inferred catalog ids", () => {
    renderSection();

    expect(useMissingCatalogIntegrations).toHaveBeenCalledWith(["slack"]);
  });

  it("renders nothing when every required integration is connected", () => {
    renderSection();

    expect(
      screen.queryByTestId("automation-missing-integrations"),
    ).not.toBeInTheDocument();
  });

  it("lists missing integrations for a saved automation", () => {
    useMissingCatalogIntegrations.mockReturnValue({
      missing: [{ id: "slack", name: "Slack", connectionOptions: [] }],
      installedServers: [],
      isLoading: false,
    });
    renderSection();

    expect(
      screen.getByTestId("automation-missing-integrations"),
    ).toBeInTheDocument();
    expect(screen.getByText("Slack")).toBeInTheDocument();
    expect(
      screen.getByText(I18nKey.AUTOMATIONS$DETAIL$INTEGRATIONS_MISSING),
    ).toBeInTheDocument();
  });
});
