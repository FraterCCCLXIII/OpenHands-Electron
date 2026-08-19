import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AutomationInterviewDrafts } from "#/components/features/automations/automation-interview-drafts";
import {
  NavigationProvider,
  type NavigationContextValue,
} from "#/context/navigation-context";
import { I18nKey } from "#/i18n/declaration";
import { createEmptyAutomationDraft } from "#/utils/automation-create-interview";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const navigation: NavigationContextValue = {
  currentPath: "/automations",
  conversationId: null,
  isNavigating: false,
  navigate: vi.fn(),
};

function renderDrafts(
  drafts: ReturnType<typeof createEmptyAutomationDraft>[],
) {
  return render(
    <NavigationProvider value={navigation}>
      <AutomationInterviewDrafts drafts={drafts} />
    </NavigationProvider>,
  );
}

describe("AutomationInterviewDrafts", () => {
  it("renders nothing when there are no drafts", () => {
    renderDrafts([]);
    expect(
      screen.queryByTestId("automation-interview-drafts"),
    ).not.toBeInTheDocument();
  });

  it("opens a draft conversation from the dashboard list", async () => {
    const user = userEvent.setup();
    const draft = {
      ...createEmptyAutomationDraft("conv-draft"),
      name: "Morning haiku",
      isSaved: true,
    };

    renderDrafts([draft]);

    expect(
      screen.getByText(I18nKey.AUTOMATIONS$INTERVIEW_DRAFTS_TITLE),
    ).toBeInTheDocument();
    expect(screen.getByText("Morning haiku")).toBeInTheDocument();

    await user.click(screen.getByTestId("automation-interview-draft-conv-draft"));
    expect(navigation.navigate).toHaveBeenCalledWith(
      "/conversations/conv-draft",
    );
  });
});
