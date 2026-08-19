import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import WorkflowsRedirect from "#/routes/workflows";

vi.mock("#/manifests/automation-interface", () => ({
  automationWorkflowsPath: () => "/automations/workflows",
}));

describe("WorkflowsRedirect", () => {
  it("redirects to the Automate workflows tab", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/workflows",
          element: <WorkflowsRedirect />,
        },
        {
          path: "/automations/workflows",
          element: <div data-testid="automation-workflows-page" />,
        },
      ],
      { initialEntries: ["/workflows"] },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("automation-workflows-page")).toBeInTheDocument();
  });
});
