export function scrollToConversationTurn(
  scrollContainer: HTMLElement | null,
  userEventId: string,
): void {
  const turn = document.querySelector(
    `[data-conversation-turn-id="${CSS.escape(userEventId)}"]`,
  );
  if (!(turn instanceof HTMLElement) || !scrollContainer) {
    return;
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  const turnRect = turn.getBoundingClientRect();
  const nextScrollTop =
    scrollContainer.scrollTop + (turnRect.top - containerRect.top) - 24;
  scrollContainer.scrollTo({
    top: Math.max(0, nextScrollTop),
    behavior: "smooth",
  });
}
