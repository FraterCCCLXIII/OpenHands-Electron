import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "#/utils/utils";
import { ChatInterfaceWrapper } from "./chat-interface-wrapper";
import { ConversationTabContent } from "../conversation-tabs/conversation-tab-content/conversation-tab-content";
import { ConversationNameWithStatus } from "../conversation-name-with-status";
import { ConversationTabs } from "../conversation-tabs/conversation-tabs";
import { ResizeHandle } from "../../../ui/resize-handle";
import { useResizablePanels } from "#/hooks/use-resizable-panels";
import { useConversationStore } from "#/stores/conversation-store";
import {
  useBreakpoint,
  SIDEBAR_RAIL_COLLAPSE_MAX_WIDTH,
} from "#/hooks/use-breakpoint";
import { SidebarMobileMenuToggle } from "#/components/features/sidebar/sidebar-mobile-menu-toggle";
import { ConversationOverviewDrawer } from "../conversation-overview-drawer";
import { useConversationOverviewDrawerOptional } from "../conversation-overview-drawer-context";
import { AutomationInterviewDrawer } from "#/components/features/automations/automation-interview-drawer";
import { AutomationInterviewHeader } from "#/components/features/automations/automation-interview-header";
import { useNavigation } from "#/context/navigation-context";
import { useIsAutomationInterview } from "#/hooks/use-is-automation-interview";
import { SETTINGS_LIKE_CONTENT_COLUMN_CLASS_NAME } from "#/utils/settings-like-page-layout-classes";

export const DESKTOP_CONVERSATION_PANEL_STORAGE_KEY =
  "desktop-layout-panel-width";
export const AUTOMATION_INTERVIEW_PANEL_STORAGE_KEY =
  "automation-interview-panel-width";
export const DEFAULT_CONVERSATION_LEFT_WIDTH = 50;
export const DEFAULT_AUTOMATION_INTERVIEW_LEFT_WIDTH = 36;
const CHAT_COLUMN_CLOSE_MIN_WIDTH_PX = 360;

function getDesktopTabPanelClass(isRightPanelShown: boolean) {
  return isRightPanelShown
    ? "translate-x-0 opacity-100"
    : "w-0 translate-x-full opacity-0";
}

export function ConversationMain() {
  const isMobile = useBreakpoint();
  const isSidebarRailHidden = useBreakpoint(SIDEBAR_RAIL_COLLAPSE_MAX_WIDTH);
  const { conversationId } = useNavigation();
  const isInterview = useIsAutomationInterview(conversationId);
  const { isRightPanelShown } = useConversationStore();
  const overviewDrawer = useConversationOverviewDrawerOptional();
  const isSecondaryDrawerOpen = Boolean(overviewDrawer?.section);
  const [isInterviewChatShown, setIsInterviewChatShown] = useState(true);
  const showInterviewHeader = isInterview && Boolean(conversationId);
  const showInterviewDrawer = isInterview && !isMobile;
  const showInterviewChat = !showInterviewDrawer || isInterviewChatShown;
  const showRightPane = !isMobile && (isInterview || isRightPanelShown);
  const showChatPaneHeader = !showInterviewHeader;
  const interviewHeader =
    showInterviewHeader && conversationId ? (
      <AutomationInterviewHeader
        conversationId={conversationId}
        isChatShown={isInterviewChatShown}
        onToggleChat={
          isMobile
            ? undefined
            : () => setIsInterviewChatShown((isShown) => !isShown)
        }
        leading={isSidebarRailHidden ? <SidebarMobileMenuToggle /> : undefined}
      />
    ) : null;

  const { leftWidth, rightWidth, isDragging, containerRef, handleMouseDown } =
    useResizablePanels({
      defaultLeftWidth: isInterview
        ? DEFAULT_AUTOMATION_INTERVIEW_LEFT_WIDTH
        : DEFAULT_CONVERSATION_LEFT_WIDTH,
      minLeftWidth: 30,
      maxLeftWidth: 80,
      storageKey: isInterview
        ? AUTOMATION_INTERVIEW_PANEL_STORAGE_KEY
        : DESKTOP_CONVERSATION_PANEL_STORAGE_KEY,
    });
  const chatColumnRef = useRef<HTMLDivElement>(null);
  const [chatColumnMinWidth, setChatColumnMinWidth] = useState(
    CHAT_COLUMN_CLOSE_MIN_WIDTH_PX,
  );
  const [composerDockTarget, setComposerDockTarget] =
    useState<HTMLDivElement | null>(null);
  const showDockedComposer = showInterviewDrawer && !showInterviewChat;

  useLayoutEffect(() => {
    if (!showInterviewChat || isMobile) return;
    const width = chatColumnRef.current?.getBoundingClientRect().width;
    if (width && width > 0) {
      setChatColumnMinWidth(width);
    }
  }, [showInterviewChat, isMobile, leftWidth, isDragging]);

  const chatColumnWidth = isInterview
    ? showRightPane && showInterviewChat
      ? `${leftWidth}%`
      : showRightPane
        ? "0%"
        : "100%"
    : isRightPanelShown
      ? `${leftWidth}%`
      : "100%";

  const chatColumnTransitionProperty = isInterview
    ? isDragging
      ? "none"
      : "width"
    : isDragging || isSecondaryDrawerOpen
      ? "none"
      : "width";

  return (
    <div
      className={cn(
        isMobile
          ? "relative min-h-0 flex-1 flex flex-col"
          : "h-full flex flex-col overflow-hidden",
      )}
    >
      {interviewHeader}
      <div
        ref={containerRef}
        className={cn(
          "flex flex-1 overflow-hidden",
          isMobile ? "flex-col" : "transition-all duration-300 ease-in-out",
        )}
        // transition toggled at runtime based on drag state
        style={
          !isMobile
            ? { transitionProperty: isDragging ? "none" : "all" }
            : undefined
        }
      >
        {/* Chat Panel - always mounted, styled differently for mobile/desktop.
            Owns its own header (name + status) and gets bottom padding so the
            chat input doesn't slam the floor. */}
        <div
          ref={chatColumnRef}
          data-testid="conversation-chat-column"
          className={cn(
            "flex flex-col bg-base overflow-hidden",
            isMobile
              ? "flex-1"
              : isInterview
                ? "transition-[width] duration-300 ease-in-out"
                : cn(
                    "min-w-0",
                    !isSecondaryDrawerOpen &&
                      "transition-[width] duration-300 ease-in-out",
                  ),
          )}
          // panel width computed at runtime by resize hook; transition toggled by drag state
          style={
            !isMobile
              ? {
                  width: chatColumnWidth,
                  transitionProperty: chatColumnTransitionProperty,
                }
              : undefined
          }
        >
          <div
            data-testid="conversation-chat-column-content"
            className={cn(
              "flex h-full min-h-0 flex-col transition-opacity duration-300 ease-in-out",
              showInterviewChat
                ? "w-full min-w-0 opacity-100"
                : "pointer-events-none opacity-0",
            )}
            style={
              !isMobile && !showInterviewChat
                ? { minWidth: chatColumnMinWidth }
                : undefined
            }
          >
            {showChatPaneHeader ? (
              <div
                data-testid="chat-pane-header"
                className={cn(
                  "flex h-10 min-h-10 shrink-0 items-center",
                  isSidebarRailHidden && "gap-2 pl-2.5",
                )}
              >
                {isSidebarRailHidden ? <SidebarMobileMenuToggle /> : null}
                <div className="min-w-0 flex-1">
                  <ConversationNameWithStatus
                    showRightPanelToggle={!isInterview}
                  />
                </div>
              </div>
            ) : null}
            <div className="flex-1 min-h-0 flex flex-col">
              <ChatInterfaceWrapper
                isRightPanelShown={showRightPane}
                showGitControlBar={!isInterview}
                composerDockTarget={composerDockTarget}
                onDockedComposerSubmit={() => setIsInterviewChatShown(true)}
              />
            </div>
          </div>
        </div>

        {/* Resize Handle - only shown on desktop when right panel is visible */}
        {showRightPane && (!isInterview || showInterviewChat) ? (
          <ResizeHandle
            testId="conversation-panel-resize-handle"
            onMouseDown={handleMouseDown}
            isDragging={isDragging}
            showLine
          />
        ) : null}

        {/* Right panel: automation draft form, or Files/Tools. Mobile uses /panel. */}
        {!isMobile && (
          <div
            data-testid="conversation-right-pane"
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              getDesktopTabPanelClass(showRightPane),
            )}
            style={{
              width: showRightPane
                ? showInterviewChat
                  ? `${rightWidth}%`
                  : "100%"
                : "0%",
              transitionProperty: isDragging ? "opacity, transform" : "all",
            }}
          >
            <div className="flex h-full w-full flex-col">
              {showInterviewDrawer && conversationId ? (
                <div className="relative flex flex-col flex-1 min-h-0 bg-base overflow-hidden">
                  <div
                    data-testid="automation-interview-scroll"
                    className="h-full min-h-0 overflow-y-auto custom-scrollbar-always [scrollbar-gutter:stable] px-5 pt-5 pb-5"
                  >
                    <div className={SETTINGS_LIKE_CONTENT_COLUMN_CLASS_NAME}>
                      <AutomationInterviewDrawer
                        key={conversationId}
                        conversationId={conversationId}
                        reserveComposerSpace={showDockedComposer}
                      />
                    </div>
                  </div>
                  {showDockedComposer ? (
                    <div className="pointer-events-none absolute inset-0 z-20 [scrollbar-gutter:stable] px-5">
                      <div
                        className={cn(
                          SETTINGS_LIKE_CONTENT_COLUMN_CLASS_NAME,
                          "relative h-full",
                        )}
                      >
                        <div
                          ref={setComposerDockTarget}
                          data-testid="interview-docked-composer"
                          className="pointer-events-auto absolute inset-x-0 bottom-5 overflow-visible rounded-[15px] shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <div
                    data-testid="tabs-pane-header"
                    className="flex shrink-0 flex-col border-b border-[var(--oh-border)]"
                  >
                    <ConversationTabs isPanelResizing={isDragging} />
                  </div>
                  <div className="flex-1 min-h-0 flex flex-col">
                    <ConversationTabContent />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        <ConversationOverviewDrawer
          isMobile={isMobile}
          resizeContainerRef={containerRef}
        />
      </div>
    </div>
  );
}
