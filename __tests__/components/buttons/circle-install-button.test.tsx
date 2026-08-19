import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CircleInstallButton } from "#/components/shared/buttons/circle-install-button";
import { I18nKey } from "#/i18n/declaration";

describe("CircleInstallButton", () => {
  it("installs on click", async () => {
    const user = userEvent.setup();
    const onInstall = vi.fn();

    render(
      <CircleInstallButton
        testId="plugin-install-demo"
        onInstall={onInstall}
      />,
    );

    const button = screen.getByTestId("plugin-install-demo");
    expect(button).toHaveAttribute(
      "aria-label",
      I18nKey.SETTINGS$PLUGINS_INSTALL,
    );
    expect(button).not.toHaveAttribute("role", "switch");

    await user.click(button);
    expect(onInstall).toHaveBeenCalledTimes(1);
  });

  it("does not install when disabled", async () => {
    const user = userEvent.setup();
    const onInstall = vi.fn();

    render(
      <CircleInstallButton
        testId="plugin-install-demo"
        isDisabled
        onInstall={onInstall}
      />,
    );

    await user.click(screen.getByTestId("plugin-install-demo"));
    expect(onInstall).not.toHaveBeenCalled();
  });
});
