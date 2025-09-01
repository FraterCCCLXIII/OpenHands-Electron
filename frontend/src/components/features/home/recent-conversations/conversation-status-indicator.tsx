import { useMemo } from "react";
import { ConversationStatus } from "#/types/conversation-status";
import { cn } from "#/utils/utils";

interface ConversationStatusIndicatorProps {
  conversationStatus: ConversationStatus;
  hasError?: boolean;
}

export function ConversationStatusIndicator({
  conversationStatus,
  hasError = false,
}: ConversationStatusIndicatorProps) {
  const conversationStatusBackgroundColor = useMemo(() => {
    // Error state takes priority - show red dot
    if (hasError) {
      return "bg-[#FF684E]"; // Error - red
    }

    switch (conversationStatus) {
      case "STOPPED":
        return "bg-[#3c3c4a]"; // Inactive/stopped - grey
      case "RUNNING":
        return "bg-[#1FBD53]"; // Running/online - green
      case "STARTING":
        return "bg-[#FFD43B]"; // Busy/starting - yellow
      default:
        return "bg-[#3c3c4a]"; // Default to grey for unknown states
    }
  }, [conversationStatus, hasError]);

  const getStatusLabel = (status: ConversationStatus) => {
    switch (status) {
      case "STOPPED":
        return "Stopped";
      case "RUNNING":
        return "Running";
      case "STARTING":
        return "Starting";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      className={cn(
        "w-1.5 h-1.5 rounded-full relative group cursor-help",
        conversationStatusBackgroundColor,
      )}
    >
      {/* Tooltip */}
      <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] border border-[#454545] shadow-lg">
        {getStatusLabel(conversationStatus)}
        {/* Arrow */}
        <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-[#1a1a1a]"></div>
      </div>
    </div>
  );
}
