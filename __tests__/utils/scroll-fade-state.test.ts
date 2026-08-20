import { describe, expect, it } from "vitest";
import {
  readScrollFadeState,
  readVerticalScrollFadeState,
} from "#/utils/scroll-fade-state";

function mockHorizontalScrollMetrics(
  element: HTMLElement,
  metrics: { scrollWidth: number; clientWidth: number; scrollLeft: number },
) {
  Object.defineProperty(element, "scrollWidth", {
    configurable: true,
    value: metrics.scrollWidth,
  });
  Object.defineProperty(element, "clientWidth", {
    configurable: true,
    value: metrics.clientWidth,
  });
  Object.defineProperty(element, "scrollLeft", {
    configurable: true,
    writable: true,
    value: metrics.scrollLeft,
  });
}

function mockVerticalScrollMetrics(
  element: HTMLElement,
  metrics: { scrollHeight: number; clientHeight: number; scrollTop: number },
) {
  Object.defineProperty(element, "scrollHeight", {
    configurable: true,
    value: metrics.scrollHeight,
  });
  Object.defineProperty(element, "clientHeight", {
    configurable: true,
    value: metrics.clientHeight,
  });
  Object.defineProperty(element, "scrollTop", {
    configurable: true,
    writable: true,
    value: metrics.scrollTop,
  });
}

describe("readScrollFadeState", () => {
  it("hides both fades when content fits horizontally", () => {
    const element = document.createElement("div");
    mockHorizontalScrollMetrics(element, {
      scrollWidth: 400,
      clientWidth: 400,
      scrollLeft: 0,
    });

    expect(readScrollFadeState(element)).toEqual({ left: false, right: false });
  });
});

describe("readVerticalScrollFadeState", () => {
  it("hides both fades when content fits vertically", () => {
    const element = document.createElement("div");
    mockVerticalScrollMetrics(element, {
      scrollHeight: 400,
      clientHeight: 400,
      scrollTop: 0,
    });

    expect(readVerticalScrollFadeState(element)).toEqual({
      top: false,
      bottom: false,
    });
  });

  it("shows only the bottom fade at the top of an overflowing scroller", () => {
    const element = document.createElement("div");
    mockVerticalScrollMetrics(element, {
      scrollHeight: 900,
      clientHeight: 320,
      scrollTop: 0,
    });

    expect(readVerticalScrollFadeState(element)).toEqual({
      top: false,
      bottom: true,
    });
  });

  it("shows only the top fade at the bottom of an overflowing scroller", () => {
    const element = document.createElement("div");
    mockVerticalScrollMetrics(element, {
      scrollHeight: 900,
      clientHeight: 320,
      scrollTop: 580,
    });

    expect(readVerticalScrollFadeState(element)).toEqual({
      top: true,
      bottom: false,
    });
  });
});
