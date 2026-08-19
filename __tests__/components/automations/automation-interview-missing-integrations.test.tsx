import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTOMATION_INTERVIEW_MISSING_INTEGRATIONS_TEST_ID,
  AutomationInterviewMissingIntegrations,
} from "#/components/features/automations/automation-interview-missing-integrations";
import { I18nKey } from "#/i18n/declaration";
import { createEmptyAutomationDraft } from "#/utils/automation-create-interview";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

let mockMissingIntegrations: Array<{
  id: string;
  name: string;
  connectionOptions: unknown[];
}> = [];

vi.mock("#/hooks/query/use-missing-catalog-integrations", () => ({
  useMissingCatalogIntegrations: () => ({
    missing: mockMissingIntegrations,
    installedServers: [],
    isLoading: false,
  }),
}));

const installableGithub = {
  id: "github",
  name: "GitHub",
  connectionOptions: [
    {
      id: "api",
      provider: "mcp",
      transport: { kind: "shttp", url: "https://example.com/mcp" },
      auth: { strategy: "api_key" },
    },
  ],
};

function renderMissing(draft = createEmptyAutomationDraft("conv-1")) {
  return render(<AutomationInterviewMissingIntegrations draft={draft} />);
}

describe("AutomationInterviewMissingIntegrations", () => {
  beforeEach(() => {
    mockMissingIntegrations = [];
  });

  it("renders nothing when every required integration is connected", () => {
    renderMissing();

    expect(
      screen.queryByTestId(AUTOMATION_INTERVIEW_MISSING_INTEGRATIONS_TEST_ID),
    ).not.toBeInTheDocument();
  });

  it("lists each missing integration as a compact connect row", () => {
    mockMissingIntegrations = [installableGithub];

    renderMissing();

    expect(
      screen.getByTestId(AUTOMATION_INTERVIEW_MISSING_INTEGRATIONS_TEST_ID),
    ).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(
      screen.getByTestId("automation-missing-integration-connect-github"),
    ).toHaveTextContent(I18nKey.AUTOMATIONS$INTERVIEW_INTEGRATIONS_CONNECT);
    expect(
      screen.queryByText(I18nKey.AUTOMATIONS$INTERVIEW_INTEGRATIONS_MISSING),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(I18nKey.SETUP$MANAGE_INTEGRATIONS),
    ).not.toBeInTheDocument();
  });
});
