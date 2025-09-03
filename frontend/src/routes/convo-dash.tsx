import React from "react";
import { useTranslation } from "react-i18next";
import { RecentConversations } from "#/components/features/home/recent-conversations/recent-conversations";
import { ConversationDemo } from "#/components/demo/conversation-demo";

function ConvoDashScreen() {
  const { t } = useTranslation();

  return (
    <div
      data-testid="convo-dash-screen"
      className="bg-[#26282D] h-full flex flex-col pt-[35px] overflow-y-auto rounded-xl px-[42px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Conversation Dashboard
          </h1>
          <p className="text-[#A3A3A3] text-sm">
            Manage and monitor your conversations
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Conversations Panel */}
        <div className="bg-[#1F2228] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Conversations
          </h2>
          <RecentConversations />
        </div>

        {/* Conversation Demo Panel */}
        <div className="bg-[#1F2228] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Conversation Demo
          </h2>
          <ConversationDemo />
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-8 bg-[#1F2228] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Conversation Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#C9B974]">12</div>
            <div className="text-sm text-[#A3A3A3]">Total Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#4CAF50]">8</div>
            <div className="text-sm text-[#A3A3A3]">Active Conversations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#FF9800]">4</div>
            <div className="text-sm text-[#A3A3A3]">Archived Conversations</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConvoDashScreen;
