import React from "react";
import { HorizontalScrollFade } from "#/components/shared/horizontal-scroll-fade";

interface MarkdownTableScrollProps {
  children: React.ReactNode;
}

export { readScrollFadeState } from "#/components/shared/horizontal-scroll-fade";

export function MarkdownTableScroll({ children }: MarkdownTableScrollProps) {
  return (
    <HorizontalScrollFade
      scrollTestId="markdown-table-scroll"
      fadeTestIdPrefix="markdown-table-scroll-fade"
      scrollClassName="custom-scrollbar-always"
    >
      {children}
    </HorizontalScrollFade>
  );
}
