import { describe, expect, it } from "vitest";
import { getSystemInspection } from "#/components/features/automations/detail/run-logs-modal-helpers";

describe("getSystemInspection", () => {
  it("shows a HubSpot-style error once and keeps machine tags", () => {
    expect(
      getSystemInspection({
        error_detail: "Environment variable HUBSPOT_API_KEY is missing.",
        status_detail: {
          phase: "callback",
          kind: "execution_error",
          detail: "Environment variable HUBSPOT_API_KEY is missing.",
          source: "environment",
        },
      }),
    ).toEqual({
      error: "Environment variable HUBSPOT_API_KEY is missing.",
      statusDetail: null,
      context: "callback · execution_error · environment",
    });
  });

  it("keeps a distinct status detail when it is not the same as the error", () => {
    expect(
      getSystemInspection({
        error_detail: "Sandbox timed out.",
        status_detail: {
          phase: "callback",
          detail: "Watchdog killed the process.",
        },
      }),
    ).toEqual({
      error: "Sandbox timed out.",
      statusDetail: "Watchdog killed the process. (callback)",
      context: null,
    });
  });

  it("falls back to formatted status detail when there is no error", () => {
    expect(
      getSystemInspection({
        error_detail: null,
        status_detail: { phase: "callback", kind: "cancelled" },
      }),
    ).toEqual({
      error: null,
      statusDetail: "callback · cancelled",
      context: null,
    });
  });

  it("returns empty layers when the system reported nothing", () => {
    expect(
      getSystemInspection({
        error_detail: null,
        status_detail: null,
      }),
    ).toEqual({
      error: null,
      statusDetail: null,
      context: null,
    });
  });
});
