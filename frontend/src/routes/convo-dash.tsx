import React, { useState } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { FaCodeBranch, FaRobot, FaArrowUp, FaArrowDown, FaEye, FaComment, FaChevronDown, FaChevronRight, FaPlus, FaMinus, FaPowerOff, FaEllipsisV, FaCheckCircle, FaComments } from 'react-icons/fa';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: string;
  status: 'active' | 'completed' | 'pending';
  gitStatus: 'clean' | 'modified' | 'conflict';
  agentStatus: 'idle' | 'working' | 'error';
}

interface PullRequest {
  id: string;
  number: number;
  title: string;
  repoName: string;
  repoType: 'github' | 'gitlab' | 'bitbucket';
  conversations: Conversation[];
  status: 'open' | 'closed' | 'merged';
}

interface RepoGroup {
  name: string;
  type: 'github' | 'gitlab' | 'bitbucket';
  pullRequests: PullRequest[];
}

const ConvoDash: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [expandedPRs, setExpandedPRs] = useState<Set<string>>(new Set());

  // Mock data - Grouped by repository
  const repoGroups: RepoGroup[] = [
    {
      name: 'openhands/OpenHands-XP',
      type: 'github',
      pullRequests: [
        {
          id: 'pr-1',
          number: 143,
          title: 'Fix Session Timeout',
          repoName: 'openhands/OpenHands-XP',
          repoType: 'github',
          status: 'open',
          conversations: [
            {
              id: 'conv-1',
              title: 'Authentication flow improvements',
              lastMessage: 'I\'ve updated the login component to handle the new API...',
              lastUpdated: '2 hours ago',
              status: 'active',
              gitStatus: 'modified',
              agentStatus: 'working'
            },
            {
              id: 'conv-2',
              title: 'Session management refactor',
              lastMessage: 'The session timeout logic has been refactored...',
              lastUpdated: '1 hour ago',
              status: 'active',
              gitStatus: 'clean',
              agentStatus: 'idle'
            }
          ]
        },
        {
          id: 'pr-2',
          number: 142,
          title: 'Add Dark Mode Support',
          repoName: 'openhands/OpenHands-XP',
          repoType: 'github',
          status: 'open',
          conversations: [
            {
              id: 'conv-3',
              title: 'Theme implementation',
              lastMessage: 'Dark mode styles have been implemented across all components...',
              lastUpdated: '3 hours ago',
              status: 'completed',
              gitStatus: 'clean',
              agentStatus: 'idle'
            }
          ]
        }
      ]
    },
    {
      name: 'openhands/ui-components',
      type: 'github',
      pullRequests: [
        {
          id: 'pr-3',
          number: 141,
          title: 'Performance Optimization',
          repoName: 'openhands/ui-components',
          repoType: 'github',
          status: 'merged',
          conversations: [
            {
              id: 'conv-4',
              title: 'Bundle size reduction',
              lastMessage: 'Successfully reduced bundle size by 15%...',
              lastUpdated: '1 day ago',
              status: 'completed',
              gitStatus: 'clean',
              agentStatus: 'idle'
            },
            {
              id: 'conv-5',
              title: 'Memory leak fixes',
              lastMessage: 'Fixed several memory leaks in the component lifecycle...',
              lastUpdated: '2 days ago',
              status: 'completed',
              gitStatus: 'clean',
              agentStatus: 'idle'
            }
          ]
        }
      ]
    }
  ];

  const getRepoIcon = (repoType: string) => {
    switch (repoType) {
      case 'github':
        return (
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" className="text-white" height="1em" width="1em">
            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
          </svg>
        );
      case 'gitlab':
        return (
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 380 512" className="text-orange-500" height="1em" width="1em">
            <path d="M282.83 32H97.17C95.5 32 94.1 33.5 94.6 35.1L82.1 88.5C81.4 90.9 83.2 93.3 85.8 93.3H294.2C296.8 93.3 298.6 90.9 297.9 88.5L285.4 35.1C284.9 33.5 283.5 32 281.8 32H282.83ZM190 96H190.1C191.4 96 192.7 96.5 193.7 97.4L243.7 147.4C244.7 148.3 245.3 149.6 245.3 151V207C245.3 208.4 244.7 209.7 243.7 210.6L193.7 260.6C192.7 261.5 191.4 262 190.1 262H190C188.6 262 187.3 261.5 186.3 260.6L136.3 210.6C135.3 209.7 134.7 208.4 134.7 207V151C134.7 149.6 135.3 148.3 136.3 147.4L186.3 97.4C187.3 96.5 188.6 96 190 96ZM190 160H190.1C191.4 160 192.7 160.5 193.7 161.4L243.7 211.4C244.7 212.3 245.3 213.6 245.3 215V271C245.3 272.4 244.7 273.7 243.7 274.6L193.7 324.6C192.7 325.5 191.4 326 190.1 326H190C188.6 326 187.3 325.5 186.3 324.6L136.3 274.6C135.3 273.7 134.7 272.4 134.7 271V215C134.7 213.6 135.3 212.3 136.3 211.4L186.3 161.4C187.3 160.5 188.6 160 190 160ZM190 224H190.1C191.4 224 192.7 224.5 193.7 225.4L243.7 275.4C244.7 276.3 245.3 277.6 245.3 279V335C245.3 336.4 244.7 337.7 243.7 338.6L193.7 388.6C192.7 389.5 191.4 390 190.1 390H190C188.6 390 187.3 389.5 186.3 388.6L136.3 338.6C135.3 337.7 134.7 336.4 134.7 335V279C134.7 277.6 135.3 276.3 136.3 275.4L186.3 225.4C187.3 224.5 188.6 224 190 224ZM190 288H190.1C191.4 288 192.7 288.5 193.7 289.4L243.7 339.4C244.7 340.3 245.3 341.6 245.3 343V399C245.3 400.4 244.7 401.7 243.7 402.6L193.7 452.6C192.7 453.5 191.4 454 190.1 454H190C188.6 454 187.3 453.5 186.3 452.6L136.3 402.6C135.3 401.7 134.7 400.4 134.7 399V343C134.7 341.6 135.3 340.3 136.3 339.4L186.3 289.4C187.3 288.5 188.6 288 190 288Z"></path>
          </svg>
        );
      case 'bitbucket':
        return (
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="text-blue-500" height="1em" width="1em">
            <path d="M452 76.5C452 34.2 417.8 0 375.5 0H72.5C30.2 0-4 34.2-4 76.5v359C-4 477.8 30.2 512 72.5 512h303c42.3 0 76.5-34.2 76.5-76.5v-359zM240 320h-64v-64h64v64zm0-96h-64v-64h64v64zm0-96h-64v-64h64v64z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'completed':
        return 'text-blue-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getGitStatusColor = (status: string) => {
    switch (status) {
      case 'clean':
        return 'text-green-500';
      case 'modified':
        return 'text-yellow-500';
      case 'conflict':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'text-gray-500';
      case 'working':
        return 'text-blue-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getGitStatusText = (status: string) => {
    switch (status) {
      case 'clean':
        return 'Clean';
      case 'modified':
        return 'Modified';
      case 'conflict':
        return 'Conflict';
      default:
        return 'Unknown';
    }
  };

  const getAgentStatusText = (status: string) => {
    switch (status) {
      case 'idle':
        return 'Idle';
      case 'working':
        return 'Working';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getPrStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-green-500 bg-green-500/20';
      case 'closed':
        return 'text-red-500 bg-red-500/20';
      case 'merged':
        return 'text-blue-500 bg-blue-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getPrStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'closed':
        return 'Closed';
      case 'merged':
        return 'Merged';
      default:
        return 'Unknown';
    }
  };

  const toggleRepoExpanded = (repoName: string) => {
    const newExpanded = new Set(expandedRepos);
    if (newExpanded.has(repoName)) {
      newExpanded.delete(repoName);
    } else {
      newExpanded.add(repoName);
    }
    setExpandedRepos(newExpanded);
  };

  const togglePRExpanded = (prId: string) => {
    const newExpanded = new Set(expandedPRs);
    if (newExpanded.has(prId)) {
      newExpanded.delete(prId);
    } else {
      newExpanded.add(prId);
    }
    setExpandedPRs(newExpanded);
  };

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(selectedConversation === conversationId ? null : conversationId);
    setChatInput('');
  };

  const handleGitAction = (action: string) => {
    console.log(`Git action: ${action}`);
    // Handle git actions here
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      console.log('Sending message:', chatInput);
      setChatInput('');
    }
  };

  const handleNewConversation = (prId: string) => {
    console.log(`Creating new conversation for PR: ${prId}`);
    // Handle new conversation creation here
  };

  const handleStopRuntime = (conversationId: string) => {
    console.log('Stop runtime for conversation:', conversationId);
  };

  const handleOpenInTab = (conversationId: string) => {
    console.log('Open in tab for conversation:', conversationId);
  };

  const handleDeleteConversation = (conversationId: string) => {
    console.log('Delete conversation:', conversationId);
  };

  const handleStartRuntime = (conversationId: string) => {
    console.log('Start runtime for conversation:', conversationId);
  };

  const handleOpenInNewTab = (conversationId: string) => {
    console.log('Open in new tab for conversation:', conversationId);
  };

  const handleDeleteInactiveConversation = (conversationId: string) => {
    console.log('Delete inactive conversation:', conversationId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="heading mb-2">Conversation Dashboard</h1>
        <p className="text-[#A3A3A3]">Manage conversations organized by Pull Requests</p>
      </div>

      <div className="space-y-8">
        {repoGroups.map((repoGroup) => (
          <div key={repoGroup.name} className="bg-[#2A2D32] rounded-lg border border-[#3A3D42]">
            {/* Repository Header */}
            <div
              className="p-3 z-10 w-full justify-start shrink-0 overflow-inherit color-inherit subpixel-antialiased rounded-t-large flex items-center gap-3 pb-2 cursor-pointer hover:bg-[#32353A] transition-colors"
              onClick={() => toggleRepoExpanded(repoGroup.name)}
            >
              <div className="flex items-center gap-2">
                {getRepoIcon(repoGroup.type)}
                <span className="text-white font-semibold">{repoGroup.name}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#32353A] px-2 py-1 rounded-full">
                  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.79249 11.1936C10.2876 11.1936 10.6902 11.5962 10.6902 12.0913C10.6902 12.5864 10.2876 12.989 9.79249 12.989C9.29739 12.989 8.89478 12.5864 8.89478 12.0913C8.89478 11.5962 9.29739 11.1936 9.79249 11.1936ZM9.79249 10.1055C8.69891 10.1055 7.80664 10.9977 7.80664 12.0913C7.80664 13.1849 8.69891 14.0772 9.79249 14.0772C10.8861 14.0772 11.7783 13.1849 11.7783 12.0913C11.7783 10.9977 10.8861 10.1055 9.79249 10.1055Z" fill="white"/>
                    <path d="M2.23585 11.1936C2.73095 11.1936 3.13356 11.5962 3.13356 12.0913C3.13356 12.5864 2.73095 12.989 2.23585 12.989C1.74075 12.989 1.33814 12.5864 1.33814 12.0913C1.33814 11.5962 1.74075 11.1936 2.23585 11.1936ZM2.23585 10.1055C1.14227 10.1055 0.25 10.9977 0.25 12.0913C0.25 13.1849 1.14227 14.0772 2.23585 14.0772C3.32943 14.0772 4.2217 13.1849 4.2217 12.0913C4.2217 10.9977 3.32943 10.1055 2.23585 10.1055Z" fill="white"/>
                    <path d="M2.23585 3.16626C2.73095 3.16626 3.13356 3.56887 3.13356 4.06398C3.13356 4.55908 2.73095 4.96169 2.23585 4.96169C1.74075 4.96169 1.33814 4.55908 1.33814 4.06398C1.33814 3.56887 1.74075 3.16626 2.23585 3.16626ZM2.23585 2.07812C1.14227 2.07812 0.25 2.9704 0.25 4.06398C0.25 5.15755 1.14227 6.04983 2.23585 6.04983C3.32943 6.04983 4.2217 5.15755 4.2217 4.06398C4.2217 2.9704 3.32943 2.07812 2.23585 2.07812Z" fill="white"/>
                    <path d="M2.23633 10.1738V5.55469" stroke="white" strokeMiterlimit="10"/>
                    <path d="M9.79304 10.1763V5.33953C9.79304 4.63768 9.22176 4.06641 8.51992 4.06641H7.38281" stroke="white" strokeMiterlimit="10"/>
                    <path d="M7.38191 6.21458L5.23828 4.06551L7.38191 1.92188V6.21458Z" fill="white"/>
                  </svg>
                  <span className="text-white text-xs font-medium">{repoGroup.pullRequests.length}</span>
                </div>
                {expandedRepos.has(repoGroup.name) ? (
                  <FaChevronDown className="w-4 h-4 text-[#A3A3A3]" />
                ) : (
                  <FaChevronRight className="w-4 h-4 text-[#A3A3A3]" />
                )}
              </div>
            </div>
            <div className="border-b border-[#3A3D42] w-full"></div>

            {/* Pull Requests - Only show if repo is expanded */}
            {expandedRepos.has(repoGroup.name) && (
              <div className="space-y-0">
                {repoGroup.pullRequests.map((pr) => (
                  <div key={pr.id} className="border-b border-[#3A3D42] last:border-b-0">
                    <div
                      className="p-3 flex items-center gap-3 pb-2 cursor-pointer hover:bg-[#32353A] transition-colors"
                      onClick={() => togglePRExpanded(pr.id)}
                    >
                      <div className="flex items-center gap-2">
                        <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.79249 11.1936C10.2876 11.1936 10.6902 11.5962 10.6902 12.0913C10.6902 12.5864 10.2876 12.989 9.79249 12.989C9.29739 12.989 8.89478 12.5864 8.89478 12.0913C8.89478 11.5962 9.29739 11.1936 9.79249 11.1936ZM9.79249 10.1055C8.69891 10.1055 7.80664 10.9977 7.80664 12.0913C7.80664 13.1849 8.69891 14.0772 9.79249 14.0772C10.8861 14.0772 11.7783 13.1849 11.7783 12.0913C11.7783 10.9977 10.8861 10.1055 9.79249 10.1055Z" fill="white"/>
                          <path d="M2.23585 11.1936C2.73095 11.1936 3.13356 11.5962 3.13356 12.0913C3.13356 12.5864 2.73095 12.989 2.23585 12.989C1.74075 12.989 1.33814 12.5864 1.33814 12.0913C1.33814 11.5962 1.74075 11.1936 2.23585 11.1936ZM2.23585 10.1055C1.14227 10.1055 0.25 10.9977 0.25 12.0913C0.25 13.1849 1.14227 14.0772 2.23585 14.0772C3.32943 14.0772 4.2217 13.1849 4.2217 12.0913C4.2217 10.9977 3.32943 10.1055 2.23585 10.1055Z" fill="white"/>
                          <path d="M2.23585 3.16626C2.73095 3.16626 3.13356 3.56887 3.13356 4.06398C3.13356 4.55908 2.73095 4.96169 2.23585 4.96169C1.74075 4.96169 1.33814 4.55908 1.33814 4.06398C1.33814 3.56887 1.74075 3.16626 2.23585 3.16626ZM2.23585 2.07812C1.14227 2.07812 0.25 2.9704 0.25 4.06398C0.25 5.15755 1.14227 6.04983 2.23585 6.04983C3.32943 6.04983 4.2217 5.15755 4.2217 4.06398C4.2217 2.9704 3.32943 2.07812 2.23585 2.07812Z" fill="white"/>
                          <path d="M2.23633 10.1738V5.55469" stroke="white" strokeMiterlimit="10"/>
                          <path d="M9.79304 10.1763V5.33953C9.79304 4.63768 9.22176 4.06641 8.51992 4.06641H7.38281" stroke="white" strokeMiterlimit="10"/>
                          <path d="M7.38191 6.21458L5.23828 4.06551L7.38191 1.92188V6.21458Z" fill="white"/>
                        </svg>
                        <span className="text-white font-medium">PR #{pr.number}</span>
                        <span className="text-white">{pr.title}</span>
                        <span className={`text-sm ${getPrStatusColor(pr.status)} px-2 py-1 rounded-full text-xs font-medium`}>
                          {getPrStatusText(pr.status)}
                        </span>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNewConversation(pr.id);
                          }}
                          className="flex items-center gap-1 px-2 py-1 border border-[#717888] hover:border-[#A3A3A3] text-[#A3A3A3] hover:text-white rounded-full text-xs transition-colors"
                        >
                          <FaPlus className="w-3 h-3" />
                          <FaComment className="w-3 h-3" />
                        </button>
                        <div className="flex items-center gap-1 bg-[#32353A] px-2 py-1 rounded-full">
                          <FaComment className="w-3 h-3 text-white" />
                          <span className="text-white text-xs font-medium">{pr.conversations.length}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[#32353A] px-2 py-1 rounded-full">
                          <FaCheckCircle className="w-3 h-3 text-white" />
                          <span className="text-white text-xs font-medium">2</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[#32353A] px-2 py-1 rounded-full">
                          <FaComments className="w-3 h-3 text-white" />
                          <span className="text-white text-xs font-medium">5</span>
                        </div>
                        <div className="text-[#A3A3A3] hover:text-white transition-colors">
                          {expandedPRs.has(pr.id) ? (
                            <FaMinus className="w-3 h-3" />
                          ) : (
                            <FaPlus className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Conversations - Only show if PR is expanded */}
                    {expandedPRs.has(pr.id) && (
                      <div className="p-4 space-y-3">
                        {pr.conversations.map((conversation) => (
                          <div key={conversation.id}>
                            <div
                              className="flex flex-col p-3 bg-[#32353A] rounded-lg border border-[#3A3D42] hover:border-[#4A4D52] transition-colors cursor-pointer"
                              onClick={() => handleConversationClick(conversation.id)}
                            >
                              {/* Top section with title, status, and action buttons */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-white font-medium">{conversation.title}</h3>
                                  </div>


                                </div>

                                {/* Action Buttons - Top right */}
                                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                  <button className="text-[#A3A3A3] hover:text-white transition-colors">
                                    <FaEye className="w-4 h-4" />
                                  </button>
                                  <button className="text-[#A3A3A3] hover:text-white transition-colors">
                                    <FaComment className="w-4 h-4" />
                                  </button>
                                  <Dropdown classNames={{
                                    content: "bg-[#454545] rounded-xl border border-[#717888]"
                                  }}>
                                    <DropdownTrigger>
                                      <button className="text-[#A3A3A3] hover:text-white transition-colors">
                                        <FaEllipsisV className="w-4 h-4" />
                                      </button>
                                    </DropdownTrigger>
                                    <DropdownMenu>
                                      <DropdownItem key="stop-runtime" onClick={() => handleStopRuntime(conversation.id)}>
                                        Stop Runtime
                                      </DropdownItem>
                                      <DropdownItem key="open-in-tab" onClick={() => handleOpenInTab(conversation.id)}>
                                        Open in Tab
                                      </DropdownItem>
                                      <DropdownItem key="delete" onClick={() => handleDeleteConversation(conversation.id)}>
                                        Delete
                                      </DropdownItem>
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              </div>

                              {/* Message content */}
                              <div className="mb-2">
                                <p className="text-[#A3A3A3] text-sm line-clamp-1">
                                  {conversation.lastMessage}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-[#808080] text-xs">
                                    {conversation.lastUpdated}
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className={`w-3 h-3 ${conversation.gitStatus === 'clean' ? 'text-green-500' : conversation.gitStatus === 'modified' ? 'text-yellow-500' : 'text-red-500'}`} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M384 144c0-44.2-35.8-80-80-80s-80 35.8-80 80c0 36.4 24.3 67.1 57.5 76.8-.6 16.1-4.2 28.5-11 36.9-15.4 19.2-49.3 22.4-85.2 25.7-28.2 2.6-57.4 5.4-81.3 16.9v-144c32.5-10.2 56-40.5 56-76.3 0-44.2-35.8-80-80-80S0 35.8 0 80c0 35.8 23.5 66.1 56 76.3v199.3C23.5 365.9 0 396.2 0 432c0 44.2 35.8 80 80 80s80-35.8 80-80c0-34-21.2-63.1-51.2-74.6 3.1-5.2 7.8-9.8 14.9-13.4 16.2-8.2 40.4-10.4 66.1-12.8 42.2-3.9 90-8.4 118.2-43.4 14-17.4 21.1-39.8 21.6-67.9 31.6-10.8 54.4-40.7 54.4-75.9zM80 64c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm0 384c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zm224-320c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16z"></path>
                                      </svg>
                                      <span className={`text-xs ${conversation.gitStatus === 'clean' ? 'text-green-500' : conversation.gitStatus === 'modified' ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {conversation.gitStatus === 'clean' ? 'Clean' : conversation.gitStatus === 'modified' ? 'Modified' : 'Conflict'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className={`w-3 h-3 ${conversation.agentStatus === 'idle' ? 'text-gray-500' : conversation.agentStatus === 'working' ? 'text-blue-500' : 'text-red-500'}`} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M32,224H64V416H32A31.96166,31.96166,0,0,1,0,384V256A31.96166,31.96166,0,0,1,32,224Zm512-48V448a64.06328,64.06328,0,0,1-64,64H160a64.06328,64.06328,0,0,1-64-64V176a79.974,79.974,0,0,1,80-80H288V32a32,32,0,0,1,64,0V96H464A79.974,79.974,0,0,1,544,176ZM264,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,264,256Zm-8,128H192v32h64Zm96,0H288v32h64ZM456,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,456,256Zm-8,128H384v32h64ZM640,256V384a31.96166,31.96166,0,0,1-32,32H576V224h32A31.96166,31.96166,0,0,1,640,256Z"></path>
                                      </svg>
                                      <span className={`text-xs ${conversation.agentStatus === 'idle' ? 'text-gray-500' : conversation.agentStatus === 'working' ? 'text-blue-500' : 'text-red-500'}`}>
                                        {conversation.agentStatus === 'idle' ? 'Idle' : conversation.agentStatus === 'working' ? 'Working' : 'Error'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Chat Input Section - Inside the conversation card */}
                              {selectedConversation === conversation.id && (
                                <div className="mt-4 pt-4 border-t border-[#3A3D42]">
                                  {/* Chat Input - Single line with up arrow button */}
                                  <div className="w-full">
                                    {/* Chat Input Component */}
                                    <div
                                      className="bg-[#25272D] box-border content-stretch flex flex-col items-start justify-center p-[8px] relative rounded-[15px] w-full"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Main Input Row */}
                                      <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full gap-2">
                                        <div className="basis-0 box-border content-stretch flex flex-row gap-4 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0">
                                          {/* Chat Input Area */}
                                          <div
                                            className="box-border content-stretch flex flex-row items-center justify-start min-h-6 p-0 relative shrink-0 flex-1"
                                            data-name="Text & caret"
                                          >
                                            <div className="basis-0 flex flex-col font-normal grow justify-center leading-[0] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#d0d9fa] text-[16px] text-left">
                                              <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Type your message..."
                                                className="chat-input bg-transparent text-white text-[16px] font-normal leading-[20px] outline-none resize-none custom-scrollbar min-h-[20px] max-h-[20px] [text-overflow:inherit] [text-wrap-mode:inherit] [white-space-collapse:inherit] block whitespace-pre-wrap"
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                onClick={(e) => e.stopPropagation()}
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        {/* Send Button - Using up arrow */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSendMessage();
                                          }}
                                          className="flex items-center justify-center rounded-full border border-white size-[35px] cursor-pointer hover:bg-[#959CB2]"
                                          data-testid="submit-button"
                                        >
                                          <FaArrowUp color="white" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Git Control Bar - Below chat input */}
                                  <div className="flex flex-row gap-2.5 items-center mt-4">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGitAction("push");
                                      }}
                                      className="flex flex-row gap-1 items-center justify-center px-0.5 py-1 rounded-[100px] w-[77px] min-w-[77px] bg-[#25272D] hover:bg-[#525662] cursor-pointer"
                                    >
                                      <div className="w-3 h-3 flex items-center justify-center">
                                        <FaArrowUp className="w-3 h-3 text-white" />
                                      </div>
                                      <div className="font-normal text-white text-sm leading-5">
                                        Push
                                      </div>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGitAction("pull");
                                      }}
                                      className="flex flex-row gap-1 items-center justify-center px-0.5 py-1 rounded-[100px] w-[76px] min-w-[76px] bg-[#25272D] hover:bg-[#525662] cursor-pointer"
                                    >
                                      <div className="w-3 h-3 flex items-center justify-center">
                                        <FaArrowDown className="w-3 h-3 text-white" />
                                      </div>
                                      <div className="font-normal text-white text-sm leading-5">
                                        Pull
                                      </div>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGitAction("pr");
                                      }}
                                      className="flex flex-row gap-[11px] items-center justify-center px-2 py-1 rounded-[100px] w-[126px] min-w-[126px] h-7 bg-[#25272D] hover:bg-[#525662] cursor-pointer"
                                    >
                                      <div className="w-3 h-3 flex items-center justify-center">
                                        <FaCodeBranch className="w-3 h-3 text-white" />
                                      </div>
                                      <div className="font-normal text-white text-sm leading-5">
                                        Create PR
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                                       {/* Inactive Conversations Section */}
                   {expandedPRs.has(pr.id) && (
                     <div className="px-4 pb-4">
                       <div className="flex items-center gap-2 mb-3">
                          <span className="text-[#A3A3A3] text-sm font-medium">Inactive Conversations</span>
                          <div className="flex items-center gap-1 bg-[#32353A] px-2 py-1 rounded-full">
                            <FaComment className="w-3 h-3 text-white" />
                            <span className="text-white text-xs font-medium">3</span>
                          </div>
                        </div>
                                               <div className="space-y-2">
                         <div className="flex items-center justify-between p-2 bg-[#2A2D32] rounded border border-[#3A3D42] hover:border-[#4A4D52] transition-colors cursor-pointer">
                           <div className="flex-1">
                             <h4 className="text-[#A3A3A3] text-sm font-medium">Initial setup discussion</h4>
                             <p className="text-[#666666] text-xs mt-1">3 days ago</p>
                           </div>
                           <div className="flex items-center gap-1 ml-2">
                             <Dropdown classNames={{
                               content: "bg-[#454545] rounded-xl border border-[#717888]"
                             }}>
                               <DropdownTrigger>
                                 <button className="text-[#808080] hover:text-[#A3A3A3] transition-colors">
                                   <FaEllipsisV className="w-3 h-3" />
                                 </button>
                               </DropdownTrigger>
                               <DropdownMenu>
                                 <DropdownItem key="start-runtime" onClick={() => handleStartRuntime("inactive-1")}>
                                   Start Runtime
                                 </DropdownItem>
                                 <DropdownItem key="open-in-new-tab" onClick={() => handleOpenInNewTab("inactive-1")}>
                                   Open in New Tab
                                 </DropdownItem>
                                 <DropdownItem key="delete" onClick={() => handleDeleteInactiveConversation("inactive-1")}>
                                   Delete
                                 </DropdownItem>
                               </DropdownMenu>
                             </Dropdown>
                           </div>
                         </div>

                         <div className="flex items-center justify-between p-2 bg-[#2A2D32] rounded border border-[#3A3D42] hover:border-[#4A4D52] transition-colors cursor-pointer">
                           <div className="flex-1">
                             <h4 className="text-[#A3A3A3] text-sm font-medium">API integration planning</h4>
                             <p className="text-[#666666] text-xs mt-1">1 week ago</p>
                           </div>
                           <div className="flex items-center gap-1 ml-2">
                             <Dropdown classNames={{
                               content: "bg-[#454545] rounded-xl border border-[#717888]"
                             }}>
                               <DropdownTrigger>
                                 <button className="text-[#808080] hover:text-[#A3A3A3] transition-colors">
                                   <FaEllipsisV className="w-3 h-3" />
                                 </button>
                               </DropdownTrigger>
                               <DropdownMenu>
                                 <DropdownItem key="start-runtime" onClick={() => handleStartRuntime("inactive-2")}>
                                   Start Runtime
                                 </DropdownItem>
                                 <DropdownItem key="open-in-new-tab" onClick={() => handleOpenInNewTab("inactive-2")}>
                                   Open in New Tab
                                 </DropdownItem>
                                 <DropdownItem key="delete" onClick={() => handleDeleteInactiveConversation("inactive-2")}>
                                   Delete
                                 </DropdownItem>
                               </DropdownMenu>
                             </Dropdown>
                           </div>
                         </div>

                         <div className="flex items-center justify-between p-2 bg-[#2A2D32] rounded border border-[#3A3D42] hover:border-[#4A4D52] transition-colors cursor-pointer">
                           <div className="flex-1">
                             <h4 className="text-[#A3A3A3] text-sm font-medium">Database schema review</h4>
                             <p className="text-[#666666] text-xs mt-1">2 weeks ago</p>
                           </div>
                           <div className="flex items-center gap-1 ml-2">
                             <Dropdown classNames={{
                               content: "bg-[#454545] rounded-xl border border-[#717888]"
                             }}>
                               <DropdownTrigger>
                                 <button className="text-[#808080] hover:text-[#A3A3A3] transition-colors">
                                   <FaEllipsisV className="w-3 h-3" />
                                 </button>
                               </DropdownTrigger>
                               <DropdownMenu>
                                 <DropdownItem key="start-runtime" onClick={() => handleStartRuntime("inactive-3")}>
                                   Start Runtime
                                 </DropdownItem>
                                 <DropdownItem key="open-in-new-tab" onClick={() => handleOpenInNewTab("inactive-3")}>
                                   Open in New Tab
                                 </DropdownItem>
                                 <DropdownItem key="delete" onClick={() => handleDeleteInactiveConversation("inactive-3")}>
                                   Delete
                                 </DropdownItem>
                               </DropdownMenu>
                             </Dropdown>
                           </div>
                         </div>
                       </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConvoDash;
