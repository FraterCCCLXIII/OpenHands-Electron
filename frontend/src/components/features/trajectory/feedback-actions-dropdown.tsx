import React from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { FaEllipsisV } from "react-icons/fa";
import { useClickOutsideElement } from "#/hooks/use-click-outside-element";
import { ContextMenu } from "../context-menu/context-menu";
import { ContextMenuListItem } from "../context-menu/context-menu-list-item";
import ThumbsUpIcon from "#/icons/thumbs-up.svg?react";
import ThumbDownIcon from "#/icons/thumbs-down.svg?react";
import ExportIcon from "#/icons/export.svg?react";

interface FeedbackActionsDropdownProps {
  onPositiveFeedback: () => void;
  onNegativeFeedback: () => void;
  onExportTrajectory: () => void;
}

export function FeedbackActionsDropdown({
  onPositiveFeedback,
  onNegativeFeedback,
  onExportTrajectory,
}: FeedbackActionsDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useClickOutsideElement<HTMLDivElement>(() => setIsOpen(false));

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handlePositiveFeedback = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onPositiveFeedback();
    setIsOpen(false);
  };

  const handleNegativeFeedback = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onNegativeFeedback();
    setIsOpen(false);
  };

  const handleExportTrajectory = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onExportTrajectory();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        data-testid="feedback-actions-dropdown-trigger"
        type="button"
        onClick={handleToggle}
        className="p-1 hover:bg-neutral-500 rounded transition-colors"
        aria-label="Feedback actions"
      >
        <FaEllipsisV className="w-4 h-4 text-content-secondary" />
      </button>

      {isOpen && (
        <ContextMenu
          testId="feedback-actions-dropdown"
          className="absolute bottom-full right-0 mb-2 min-w-[200px] z-50"
        >
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
  );
}
