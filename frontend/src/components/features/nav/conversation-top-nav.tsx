import React from "react";
import { IoShareOutline } from "react-icons/io5";
import { VscPlay } from "react-icons/vsc";
import { Monitor } from "lucide-react";
import { FaEllipsisV } from "react-icons/fa";
import { Button } from "#/components/ui/button";
import { useActiveConversation } from "#/hooks/query/use-active-conversation";
import { useClickOutsideElement } from "#/hooks/use-click-outside-element";
import { ContextMenu } from "../context-menu/context-menu";
import { ContextMenuListItem } from "../context-menu/context-menu-list-item";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import ThumbsUpIcon from "#/icons/thumbs-up.svg?react";
import ThumbDownIcon from "#/icons/thumbs-down.svg?react";
import ExportIcon from "#/icons/export.svg?react";

interface ConversationTopNavProps {
  onShare?: () => void;
  onRun?: () => void;
  onDrawerToggle?: () => void;
  onPositiveFeedback?: () => void;
  onNegativeFeedback?: () => void;
  onExportTrajectory?: () => void;
  onDownloadVSCode?: () => void;
  onDisplayCost?: () => void;
  onShowAgentTools?: () => void;
  onShowMicroagents?: () => void;
}

export function ConversationTopNav({
  onShare,
  onRun,
  onDrawerToggle,
  onPositiveFeedback,
  onNegativeFeedback,
  onExportTrajectory,
  onDownloadVSCode,
  onDisplayCost,
  onShowAgentTools,
  onShowMicroagents,
}: ConversationTopNavProps) {
  const { data: conversation } = useActiveConversation();
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = useClickOutsideElement<HTMLDivElement>(() => {
    setIsDropdownOpen(false);
  });

  // Use conversation title or fallback to a default name
  const conversationName = conversation?.title || "Untitled Conversation";

  const handleToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleShare = () => {
    onShare?.();
    setIsDropdownOpen(false);
  };

  const handleRun = () => {
    onRun?.();
    setIsDropdownOpen(false);
  };

  const handleDrawerToggle = () => {
    onDrawerToggle?.();
    setIsDropdownOpen(false);
  };

  const handlePositiveFeedback = () => {
    onPositiveFeedback?.();
    setIsDropdownOpen(false);
  };

  const handleNegativeFeedback = () => {
    onNegativeFeedback?.();
    setIsDropdownOpen(false);
  };

  const handleExportTrajectory = () => {
    onExportTrajectory?.();
    setIsDropdownOpen(false);
  };

  const handleDownloadVSCode = () => {
    onDownloadVSCode?.();
    setIsDropdownOpen(false);
  };

  const handleDisplayCost = () => {
    onDisplayCost?.();
    setIsDropdownOpen(false);
  };

  const handleShowAgentTools = () => {
    onShowAgentTools?.();
    setIsDropdownOpen(false);
  };

  const handleShowMicroagents = () => {
    onShowMicroagents?.();
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-4 bg-base">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-content">{conversationName}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Ellipsis dropdown - positioned to the left of existing buttons */}
        <div className="relative" ref={dropdownRef}>
          <button
            data-testid="ellipsis-button"
            type="button"
            onClick={handleToggle}
            className="p-1 hover:bg-neutral-500 rounded transition-colors"
          >
            <FaEllipsisV className="w-4 h-4 text-content-secondary" />
          </button>

          {isDropdownOpen && (
            <ContextMenu
              testId="conversation-top-nav-dropdown"
              className="absolute top-full right-0 mt-2 min-w-[200px] z-50"
            >
              <ContextMenuListItem
                testId="share-conversation"
                onClick={handleShare}
              >
                <div className="flex items-center gap-2">
                  <IoShareOutline className="w-4 h-4" />
                  <span>Share Conversation</span>
                </div>
              </ContextMenuListItem>
              <ContextMenuListItem
                testId="run-conversation"
                onClick={handleRun}
              >
                <div className="flex items-center gap-2">
                  <VscPlay className="w-4 h-4" />
                  <span>Run Conversation</span>
                </div>
              </ContextMenuListItem>
              <ContextMenuListItem
                testId="toggle-drawer"
                onClick={handleDrawerToggle}
              >
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>Toggle Drawer</span>
                </div>
              </ContextMenuListItem>

              {/* New menu items */}
              <ContextMenuListItem
                testId="download-vscode-button"
                onClick={handleDownloadVSCode}
              >
                <div className="flex items-center gap-2">
                  <span>Download via VS Code</span>
                </div>
              </ContextMenuListItem>
              <ContextMenuListItem
                testId="display-cost-button"
                onClick={handleDisplayCost}
              >
                <div className="flex items-center gap-2">
                  <span>Display Cost</span>
                </div>
              </ContextMenuListItem>
              <ContextMenuListItem
                testId="show-agent-tools-button"
                onClick={handleShowAgentTools}
              >
                <div className="flex items-center gap-2">
                  <span>Show Agent Tools & Metadata</span>
                </div>
              </ContextMenuListItem>
              <ContextMenuListItem
                testId="show-microagents-button"
                onClick={handleShowMicroagents}
              >
                <div className="flex items-center gap-2">
                  <span>Show Available Microagents</span>
                </div>
              </ContextMenuListItem>

              {/* Feedback Actions */}
              <ContextMenuListItem
                testId="positive-feedback"
                onClick={handlePositiveFeedback}
              >
                <div className="flex items-center gap-2">
                  <ThumbsUpIcon width={15} height={15} />
                  <span>{t(I18nKey.BUTTON$MARK_HELPFUL)}</span>
                </div>
              </ContextMenuListItem>
              <ContextMenuListItem
                testId="negative-feedback"
                onClick={handleNegativeFeedback}
              >
                <div className="flex items-center gap-2">
                  <ThumbDownIcon width={15} height={15} />
                  <span>{t(I18nKey.BUTTON$MARK_NOT_HELPFUL)}</span>
                </div>
              </ContextMenuListItem>
              <ContextMenuListItem
                testId="export-trajectory"
                onClick={handleExportTrajectory}
              >
                <div className="flex items-center gap-2">
                  <ExportIcon width={15} height={15} />
                  <span>{t(I18nKey.BUTTON$EXPORT_CONVERSATION)}</span>
                </div>
              </ContextMenuListItem>
            </ContextMenu>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-content-secondary hover:text-content"
        >
          <IoShareOutline className="w-5 h-5" />
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleRun}
          className="bg-white text-black hover:bg-gray-100"
        >
          <VscPlay className="w-5 h-5 mr-1" />
          Run
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDrawerToggle}
          className="text-content-secondary hover:text-content"
        >
          <Monitor className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
