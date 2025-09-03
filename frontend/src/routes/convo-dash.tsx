import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { FaGithub, FaGitlab, FaBitbucket } from "react-icons/fa";
import { MdFolder } from "react-icons/md";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: string;
  repoName: string;
  repoType: "github" | "gitlab" | "bitbucket" | "local";
  status: "active" | "archived" | "completed";
}

interface RepoGroup {
  name: string;
  type: "github" | "gitlab" | "bitbucket" | "local";
  conversations: Conversation[];
}

function ConvoDashScreen() {
  const { t } = useTranslation();

  // Mock data for demonstration
  const repoGroups: RepoGroup[] = [
    {
      name: "openhands/OpenHands-XP",
      type: "github",
      conversations: [
        {
          id: "1",
          title: "Fix authentication flow",
          lastMessage: "I've updated the login component to handle the new API...",
          lastUpdated: "2 hours ago",
          repoName: "openhands/OpenHands-XP",
          repoType: "github",
          status: "active",
        },
        {
          id: "2",
          title: "Add new dashboard feature",
          lastMessage: "The conversation dashboard is now working with repo grouping...",
          lastUpdated: "1 day ago",
          repoName: "openhands/OpenHands-XP",
          repoType: "github",
          status: "active",
        },
      ],
    },
    {
      name: "my-company/frontend-app",
      type: "gitlab",
      conversations: [
        {
          id: "3",
          title: "Implement user management",
          lastMessage: "Working on the user roles and permissions system...",
          lastUpdated: "3 hours ago",
          repoName: "my-company/frontend-app",
          repoType: "gitlab",
          status: "active",
        },
      ],
    },
    {
      name: "personal/project-utils",
      type: "local",
      conversations: [
        {
          id: "4",
          title: "Create utility functions",
          lastMessage: "Added new helper functions for data processing...",
          lastUpdated: "5 hours ago",
          repoName: "personal/project-utils",
          repoType: "local",
          status: "completed",
        },
      ],
    },
  ];

  const getRepoIcon = (type: string) => {
    switch (type) {
      case "github":
        return <FaGithub className="text-gray-700" />;
      case "gitlab":
        return <FaGitlab className="text-orange-500" />;
      case "bitbucket":
        return <FaBitbucket className="text-blue-500" />;
      default:
        return <MdFolder className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "archived":
        return "text-gray-500";
      case "completed":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-[#26282D] h-full flex flex-col pt-[35px] overflow-y-auto rounded-xl px-[42px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Conversation Dashboard
          </h1>
          <p className="text-[#A3A3A3] text-sm">
            Conversations organized by repository
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-white font-semibold">
              {repoGroups.reduce((acc, group) => acc + group.conversations.length, 0)} Conversations
            </div>
            <div className="text-[#A3A3A3] text-sm">
              Across {repoGroups.length} repositories
            </div>
          </div>
        </div>
      </div>

      {/* Repository Groups */}
      <div className="space-y-6">
        {repoGroups.map((repoGroup) => (
          <Card key={repoGroup.name} className="bg-[#2A2D32] border border-[#3A3D42]">
            <CardHeader className="flex items-center gap-3 pb-2">
              <div className="flex items-center gap-2">
                {getRepoIcon(repoGroup.type)}
                <span className="text-white font-semibold">{repoGroup.name}</span>
              </div>
              <div className="ml-auto text-[#A3A3A3] text-sm">
                {repoGroup.conversations.length} conversation{repoGroup.conversations.length !== 1 ? 's' : ''}
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-3">
                {repoGroup.conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center justify-between p-3 bg-[#32353A] rounded-lg border border-[#3A3D42] hover:border-[#4A4D52] transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{conversation.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conversation.status)} bg-opacity-20`}>
                          {conversation.status}
                        </span>
                      </div>
                      <p className="text-[#A3A3A3] text-sm line-clamp-1">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-[#808080] text-xs mt-1">
                        {conversation.lastUpdated}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-[#A3A3A3] hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="text-[#A3A3A3] hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {repoGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-[#A3A3A3] text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No conversations yet</h3>
            <p className="text-sm">Start a conversation to see it organized by repository here.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConvoDashScreen;
