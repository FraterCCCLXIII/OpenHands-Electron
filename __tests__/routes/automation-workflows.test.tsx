import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { I18nKey } from "#/i18n/declaration";
import AutomationWorkflows, {
  clientLoader as workflowsLoader,
} from "#/routes/automation-workflows";

vi.mock("#/manifests/manifest-sources", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("#/manifests/manifest-sources")>();
  const { createInterfaceManifestWithSubPages } =
    await import("../manifests/manifest-test-data");
  return {
    ...actual,
    AUTOMATION_INTERFACE_CANDIDATE: createInterfaceManifestWithSubPages(),
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

function renderWorkflowsPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/automations/workflows"]}>
        <AutomationWorkflows />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("AutomationWorkflows", () => {
  it("admits the route and renders the SDLC board in the Automate shell", async () => {
    expect(workflowsLoader()).toBeNull();
    renderWorkflowsPage();

    expect(
      await screen.findByText(I18nKey.WORKFLOWS$TITLE, { selector: "h1" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByTestId("automations-navigation-workflows").length,
    ).toBeGreaterThan(0);
    expect(screen.getByTestId("workflows-kanban-board")).toBeInTheDocument();
  });

  it("switches to the work board view", async () => {
    const user = userEvent.setup();
    renderWorkflowsPage();

    await user.click(screen.getByTestId("workflows-board-view-toggle"));
    await user.click(screen.getByTestId("workflows-board-view-work"));

    expect(screen.getByTestId("workflows-work-kanban-board")).toBeInTheDocument();
    expect(screen.queryByTestId("workflows-kanban-board")).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem("openhands-workflows-board-view"),
    ).toBe("work");
  });
});
