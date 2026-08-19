import { describe, expect, it } from "vitest";
import { readVerticalScrollEdgeState } from "#/components/shared/vertical-scroll-edges";

function createScrollElement(metrics: {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}) {
  return {
    scrollTop: metrics.scrollTop,
    scrollHeight: metrics.scrollHeight,
    clientHeight: metrics.clientHeight,
  } as HTMLDivElement;
}

describe("readVerticalScrollEdgeState", () => {
  it("hides both edges when content fits", () => {
    expect(
      readVerticalScrollEdgeState(
        createScrollElement({
          scrollTop: 0,
          scrollHeight: 200,
          clientHeight: 200,
        }),
      ),
    ).toEqual({ top: false, bottom: false });
  });

  it("shows only the bottom edge at the top of a scrollable region", () => {
    expect(
      readVerticalScrollEdgeState(
        createScrollElement({
          scrollTop: 0,
          scrollHeight: 400,
          clientHeight: 200,
        }),
      ),
    ).toEqual({ top: false, bottom: true });
  });

  it("shows both edges when scrolled within a scrollable region", () => {
    expect(
      readVerticalScrollEdgeState(
        createScrollElement({
          scrollTop: 100,
          scrollHeight: 400,
          clientHeight: 200,
        }),
      ),
    ).toEqual({ top: true, bottom: true });
  });

  it("shows the top edge but keeps the bottom edge when scrolled to the end", () => {
    expect(
      readVerticalScrollEdgeState(
        createScrollElement({
          scrollTop: 200,
          scrollHeight: 400,
          clientHeight: 200,
        }),
      ),
    ).toEqual({ top: true, bottom: true });
  });
});
