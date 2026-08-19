import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChatInterface } from "../../chat/chat-interface";
import { ConversationOverviewPanel } from "../conversation-overview-panel";
import { useConversationStore } from "#/stores/conversation-store";
import { useBreakpoint } from "#/hooks/use-breakpoint";
import { useConversationOverviewLayoutMode } from "#/hooks/use-conversation-overview-layout-mode";
import {
  CONVERSATION_OVERVIEW_COLUMN_WIDTH_PX,
  CONVERSATION_OVERVIEW_PANEL_TRANSITION,
  CONVERSATION_OVERVIEW_THREAD_MAX_WIDTH_PX,
} from "../conversation-overview-panel.constants";
import { cn } from "#/utils/utils";

interface ChatInterfaceWrapperProps {
  isRightPanelShown: boolean;
}

const THREAD_CLASSNAME = "w-full min-w-0 h-full flex flex-col min-h-0";

export function ChatInterfaceWrapper({
  isRightPanelShown: _isRightPanelShown,
}: ChatInterfaceWrapperProps) {
  const isMobile = useBreakpoint();
  const reduceMotion = useReducedMotion();
  const enableOverviewMotion = !reduceMotion && import.meta.env.MODE !== "test";
  const isOverviewPanelShown = useConversationStore(
    (state) => state.isOverviewPanelShown,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const wantsOverviewPanel = !isMobile && isOverviewPanelShown;
  const overviewLayoutMode = useConversationOverviewLayoutMode(
    containerRef,
    wantsOverviewPanel,
  );
  const showOverviewPanel =
    wantsOverviewPanel && overviewLayoutMode !== "hidden";
  const isOverlayOverview = overviewLayoutMode === "overlay";

  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-0 w-full overflow-hidden"
    >
      <div className="flex min-h-0 min-w-0 flex-1 justify-center overflow-hidden">
        <div
          className={THREAD_CLASSNAME}
          style={{ maxWidth: CONVERSATION_OVERVIEW_THREAD_MAX_WIDTH_PX }}
        >
          <ChatInterface />
        </div>
      </div>
      <AnimatePresence>
        {showOverviewPanel ? (
          <motion.div
            key="conversation-overview-column"
            data-testid="conversation-overview-column"
            data-layout-mode={overviewLayoutMode}
            initial={
              enableOverviewMotion
                ? isOverlayOverview
                  ? { opacity: 0, x: 16 }
                  : { width: 0, opacity: 0 }
                : false
            }
            animate={
              isOverlayOverview
                ? { opacity: 1, x: 0 }
                : {
                    width: CONVERSATION_OVERVIEW_COLUMN_WIDTH_PX,
                    opacity: 1,
                  }
            }
            exit={
              enableOverviewMotion
                ? isOverlayOverview
                  ? { opacity: 0, x: 16 }
                  : { width: 0, opacity: 0 }
                : { opacity: 0 }
            }
            transition={CONVERSATION_OVERVIEW_PANEL_TRANSITION}
            className={cn(
              "flex shrink-0 flex-col items-start overflow-hidden pt-4 pl-3 pr-4",
              isOverlayOverview &&
                "pointer-events-none absolute right-0 top-0 z-10 h-full [&>*]:pointer-events-auto",
            )}
            style={
              isOverlayOverview
                ? { width: CONVERSATION_OVERVIEW_COLUMN_WIDTH_PX }
                : undefined
            }
          >
            <div
              className="w-full shrink-0"
              style={{ width: CONVERSATION_OVERVIEW_COLUMN_WIDTH_PX }}
            >
              <ConversationOverviewPanel />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
