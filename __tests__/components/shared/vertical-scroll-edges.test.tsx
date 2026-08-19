import { describe, expect, it } from "vitest";
import { readVerticalScrollEdgeState } from "#/components/shared/vertical-scroll-edges";

function createScrollElement(metrics: {
  scrollHeight: number;
  clientHeight: number;
}) {
  return {
    scrollHeight: metrics.scrollHeight,
    clientHeight: metrics.clientHeight,
  } as HTMLDivElement;
}

describe("readVerticalScrollEdgeState", () => {
  it("hides the bottom edge when content fits", () => {
    expect(
      readVerticalScrollEdgeState(
        createScrollElement({
          scrollHeight: 200,
          clientHeight: 200,
        }),
      ),
    ).toEqual({ bottom: false });
  });

  it("shows the bottom edge when content overflows", () => {
    expect(
      readVerticalScrollEdgeState(
        createScrollElement({
          scrollHeight: 400,
          clientHeight: 200,
        }),
      ),
    ).toEqual({ bottom: true });
  });
});
