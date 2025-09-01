import React, { useState } from "react";
import { FaArchive } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { ConversationStatus } from "#/types/conversation-status";
import { Conversation as BaseConversation } from "#/api/open-hands.types";
import { Provider } from "#/types/settings";
import { formatTimeDelta } from "#/utils/format-time-delta";
import { cn } from "#/utils/utils";
import { ConversationStatusIndicator } from "../features/home/recent-conversations/conversation-status-indicator";
import { GitProviderIcon } from "../shared/git-provider-icon";
import CodeBranchIcon from "#/icons/u-code-branch.svg?react";
import ListIcon from "#/icons/list.svg?react";
import EllipsisIcon from "#/icons/ellipsis.svg?react";
import CircleErrorIcon from "#/icons/circle-error.svg?react";

// Extended conversation type for demo purposes
interface Conversation extends BaseConversation {
  has_error?: boolean;
}

// Mock conversation data for demonstration
const mockConversations: Conversation[] = [
  {
    conversation_id: "1",
    title: "Frontend Refactoring Project",
    selected_repository: "openhands/frontend",
    selected_branch: "main",
    git_provider: "github" as Provider,
    last_updated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: "RUNNING" as ConversationStatus,
    runtime_status: "STATUS$READY",
    url: null,
    session_api_key: null,
  },
  {
    conversation_id: "2",
    title: "API Integration Testing",
    selected_repository: "openhands/backend",
    selected_branch: "develop",
    git_provider: "github" as Provider,
    last_updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    status: "STOPPED" as ConversationStatus,
    runtime_status: null,
    url: null,
    session_api_key: null,
  },
  {
    conversation_id: "3",
    title: "Database Schema Design",
    selected_repository: null,
    selected_branch: null,
    git_provider: null,
    last_updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: "STOPPED" as ConversationStatus,
    runtime_status: null,
    url: null,
    session_api_key: null,
  },
  {
    conversation_id: "4",
    title: "Mobile App Development",
    selected_repository: "openhands/mobile",
    selected_branch: "feature/auth",
    git_provider: "gitlab" as Provider,
    last_updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    status: "STARTING" as ConversationStatus,
    runtime_status: null,
    url: null,
    session_api_key: null,
  },
  {
    conversation_id: "5",
    title: "Legacy System Migration",
    selected_repository: "legacy/old-system",
    selected_branch: "master",
    git_provider: "bitbucket" as Provider,
    last_updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    status: "STOPPED" as ConversationStatus,
    runtime_status: null,
    url: null,
    session_api_key: null,
  },
  {
    conversation_id: "6",
    title: "API Integration Testing",
    selected_repository: "api/integration-tests",
    selected_branch: "develop",
    git_provider: "gitlab" as Provider,
    last_updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: "STOPPED" as ConversationStatus,
    runtime_status: null,
    url: null,
    session_api_key: null,
    has_error: true,
  },
];

interface ConversationDemoProps {
  className?: string;
  onClose?: () => void;
}

export function ConversationDemo({ className, onClose }: ConversationDemoProps) {
  const { t } = useTranslation();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Handle close with animation
  const handleClose = () => {
    if (onClose) {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 200); // Match animation duration
    }
  };

  // Handle click outside to close
  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Show all conversations in the same list
  const displayedConversations = mockConversations;

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <div
      data-testid="conversation-panel"
      className={`w-[400px] h-full border border-[#525252] bg-[#25272D] rounded-lg overflow-y-auto absolute transform`}
      style={{
        animation: isClosing ? 'slideOutLeft 0.2s ease-out' : 'slideInLeft 0.2s ease-out'
      }}
      onClick={handleClickOutside}
    >
      {/* Custom Scrollbar Styling */}
      <style>{`
        .conversation-list::-webkit-scrollbar {
          width: 8px;
        }
        .conversation-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .conversation-list::-webkit-scrollbar-thumb {
          background: #454545;
          border-radius: 4px;
        }
        .conversation-list::-webkit-scrollbar-thumb:hover {
          background: #5C5D62;
        }

        /* Animation Keyframes */
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutLeft {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-10px);
            opacity: 0;
          }
        }


      `}</style>

      {/* Conversation List */}
      <div className="overflow-y-auto conversation-list">
        {displayedConversations.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-[#454545] rounded-full flex items-center justify-center mb-4">
              <ListIcon width={24} height={24} className="text-[#A3A3A3]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Conversations
            </h3>
            <p className="text-[#A3A3A3] text-center max-w-md">
              Start a new conversation to see it appear here.
            </p>
          </div>
        ) : (
          /* Conversation Items */
          displayedConversations.map((conversation) => {
            const isSelected = selectedConversationId === conversation.conversation_id;
            const isArchived = conversation.conversation_id === "5";
            const hasRepository = conversation.selected_repository && conversation.selected_branch;

            return (
              <div
                key={conversation.conversation_id}
                onClick={() => handleConversationClick(conversation.conversation_id)}
                className={cn(
                  "relative h-auto w-full p-3.5 border-b border-neutral-600 cursor-pointer transition-all duration-200",
                  "hover:bg-[#454545]",
                  isSelected && "bg-[#454545]",
                  isArchived && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                    {/* Status Indicator */}
                    <div className="flex items-center">
                      <ConversationStatusIndicator
                        conversationStatus={conversation.status}
                        hasError={conversation.has_error}
                      />
                    </div>

                    {/* Title */}
                    <span className="text-xs leading-6 font-semibold bg-transparent truncate overflow-hidden text-white flex items-center">
                      {conversation.title}
                    </span>

                    {/* Archive Badge */}
                    {isArchived && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#868E96] text-white text-xs font-medium rounded-full">
                        <FaArchive size={10} className="text-white" />
                        <span>Archived</span>
                      </span>
                    )}

                    {/* Error Badge */}
                    {conversation.has_error && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#FF684E] text-white text-xs font-medium rounded-full">
                        <CircleErrorIcon className="text-white w-3 h-3" />
                        <span>Error</span>
                      </span>
                    )}
                  </div>

                  {/* Ellipsis Button */}
                  <div className="flex items-center justify-end w-20">
                    <button
                      data-testid="ellipsis-button"
                      type="button"
                      className="cursor-pointer h-6 flex flex-row items-center justify-center"
                    >
                      <EllipsisIcon />
                    </button>
                  </div>
                </div>

                {/* Repository and Branch Info */}
                <div className="flex flex-row justify-between items-center mt-1">
                  <div className="flex items-center gap-3 flex-1">
                    {hasRepository ? (
                      <>
                        {/* Repository Info */}
                        <div className="flex items-center gap-1">
                          <GitProviderIcon
                            gitProvider={conversation.git_provider as Provider}
                            className="text-[#A3A3A3]"
                          />
                          <span
                            className="text-xs text-[#A3A3A3] max-w-[124px] truncate"
                            title={conversation.selected_repository || ""}
                          >
                            {conversation.selected_repository}
                          </span>
                        </div>

                        {/* Branch Info */}
                        <div className="flex items-center gap-1">
                          <CodeBranchIcon width={12} height={12} color="#A3A3A3" />
                          <span
                            className="text-xs text-[#A3A3A3] max-w-[124px] truncate"
                            title={conversation.selected_branch || ""}
                          >
                            {conversation.selected_branch}
                          </span>
                        </div>
                      </>
                    ) : (
                      /* No Repository State */
                      <div className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M14.0001 10V1.5L13.5001 1H3.74009C3.51074 1.00254 3.28375 1.04658 3.07009 1.13C2.85473 1.22571 2.66064 1.36346 2.49922 1.53518C2.33781 1.7069 2.21231 1.90913 2.13009 2.13C2.0483 2.3267 2.0042 2.53701 2.00009 2.75V12.25C1.99769 12.4798 2.04191 12.7078 2.13009 12.92C2.30709 13.347 2.64509 13.688 3.07009 13.87C3.28375 13.9534 3.51074 13.9975 3.74009 14H4.00009V13H3.74009C3.64031 13.0003 3.54156 12.9799 3.45009 12.94C3.26905 12.8649 3.12519 12.721 3.05009 12.54C3.01814 12.4466 3.00126 12.3487 3.00009 12.25V11.75C3.00126 11.6513 3.01814 11.5534 3.05009 11.46C3.12519 11.279 3.26905 11.1351 3.45009 11.06C3.54032 11.0207 3.63766 11.0002 3.73609 11H13.0001V13H9.00009V14H13.5001L14.0001 13.5V10ZM4.00009 10V2H13.0001V10H4.00009ZM5.00009 3H6.00009V4H5.00009V3ZM5.00009 5H6.00009V6H5.00009V5ZM6.00009 7H5.00009V8H6.00009V7ZM6.50009 13.49L5.28009 15H5.00009V12H8.00009V15H7.72009L6.50009 13.49Z" fill="#A3A3A3"/>
                        </svg>
                        <span className="text-xs text-[#A3A3A3]">
                          {t(I18nKey.COMMON$NO_REPOSITORY)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#A3A3A3] flex-1 text-right">
                      <time>
                        {formatTimeDelta(new Date(conversation.last_updated_at))} ago
                      </time>
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
