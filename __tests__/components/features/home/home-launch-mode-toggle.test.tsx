import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HomeLaunchModeToggle } from "#/components/features/home/home-launch-mode-toggle";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("HomeLaunchModeToggle", () => {
  it("selects Automate and reports the change", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<HomeLaunchModeToggle value="code" onChange={onChange} />);

    expect(
      screen.getByTestId("home-launch-mode-toggle-option-code"),
    ).toHaveAttribute("aria-checked", "true");

    await user.click(
      screen.getByTestId("home-launch-mode-toggle-option-automate"),
    );

    expect(onChange).toHaveBeenCalledWith("automate");
  });
});
