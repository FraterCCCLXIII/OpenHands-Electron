import React from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { FaServer, FaExternalLinkAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { DiGit } from "react-icons/di";
import { VscCode } from "react-icons/vsc";
import { I18nKey } from "#/i18n/declaration";
import { RUNTIME_INACTIVE_STATES } from "#/types/agent-state";
import { useConversationId } from "#/hooks/use-conversation-id";
import { clearTerminal } from "#/state/command-slice";
import { useEffectOnce } from "#/hooks/use-effect-once";
import GlobeIcon from "#/icons/globe.svg?react";
import JupyterIcon from "#/icons/jupyter.svg?react";
import TerminalIcon from "#/icons/terminal.svg?react";
import { clearJupyter } from "#/state/jupyter-slice";

import { ChatInterface } from "../components/features/chat/chat-interface";
import { WsClientProvider } from "#/context/ws-client-provider";
import { EventHandler } from "../wrapper/event-handler";
import { useConversationConfig } from "#/hooks/query/use-conversation-config";
import { Container } from "#/components/layout/container";
import {
  Orientation,
  ResizablePanel,
} from "#/components/layout/resizable-panel";
import { useActiveConversation } from "#/hooks/query/use-active-conversation";
import { ServedAppLabel } from "#/components/layout/served-app-label";
import { useSettings } from "#/hooks/query/use-settings";
import { RootState } from "#/store";
import { displayErrorToast } from "#/utils/custom-toast-handlers";
import { useDocumentTitleFromState } from "#/hooks/use-document-title-from-state";
import { transformVSCodeUrl } from "#/utils/vscode-url-helper";
import OpenHands from "#/api/open-hands";
import { TabContent } from "#/components/layout/tab-content";
import { useIsAuthed } from "#/hooks/query/use-is-authed";
import { ConversationTopNav } from "#/components/features/nav/conversation-top-nav";
import { useGetTrajectory } from "#/hooks/mutation/use-get-trajectory";
import { downloadTrajectory } from "#/utils/download-trajectory";
import { FeedbackModal } from "#/components/features/feedback/feedback-modal";

function AppContent() {
  useConversationConfig();
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const { conversationId } = useConversationId();
  const { data: conversation, isFetched } = useActiveConversation();
  const { data: isAuthed } = useIsAuthed();
  const params = useParams();

  const { curAgentState } = useSelector((state: RootState) => state.agent);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Set the document title to the conversation title when available
  useDocumentTitleFromState();

  const [width, setWidth] = React.useState(window.innerWidth);
  const [isRightPanelVisible, setIsRightPanelVisible] = React.useState(true);
  const [feedbackPolarity, setFeedbackPolarity] = React.useState<
    "positive" | "negative"
  >("positive");
  const [feedbackModalIsOpen, setFeedbackModalIsOpen] = React.useState(false);

  const { mutate: getTrajectory } = useGetTrajectory();

  React.useEffect(() => {
    if (isFetched && !conversation && isAuthed) {
      displayErrorToast(
        "This conversation does not exist, or you do not have permission to access it.",
      );
      navigate("/");
    }
  }, [conversation, isFetched, isAuthed]);

  React.useEffect(() => {
    dispatch(clearTerminal());
    dispatch(clearJupyter());
  }, [conversationId]);

  useEffectOnce(() => {
    dispatch(clearTerminal());
    dispatch(clearJupyter());
  });

  function handleResize() {
    setWidth(window.innerWidth);
  }

  React.useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleShare = () => {
    // Implement share functionality
    console.log("Share clicked");
  };

  const handleRun = () => {
    // Implement run functionality
    console.log("Run clicked");
  };

  const handleDrawerToggle = () => {
    setIsRightPanelVisible(!isRightPanelVisible);
  };

  const onClickShareFeedbackActionButton = async (
    polarity: "positive" | "negative",
  ) => {
    setFeedbackModalIsOpen(true);
    setFeedbackPolarity(polarity);
  };

  const onClickExportTrajectoryButton = () => {
    if (!params.conversationId) {
      displayErrorToast(t(I18nKey.CONVERSATION$DOWNLOAD_ERROR));
      return;
    }

    getTrajectory(params.conversationId, {
      onSuccess: async (data) => {
        await downloadTrajectory(
          params.conversationId ?? t(I18nKey.CONVERSATION$UNKNOWN),
          data.trajectory,
        );
      },
      onError: () => {
        displayErrorToast(t(I18nKey.CONVERSATION$DOWNLOAD_ERROR));
      },
    });
  };

  function renderMain() {
    const basePath = `/conversations/${conversationId}`;

    if (width <= 640) {
      return (
        <div className="rounded-xl overflow-hidden w-full">
          <ChatInterface isRightPanelVisible={false} />
        </div>
      );
    }
    return (
      <ResizablePanel
        orientation={Orientation.HORIZONTAL}
        className="grow h-full min-h-0 min-w-0"
        initialSize={500}
        firstClassName="rounded-xl overflow-hidden"
        secondClassName="flex flex-col overflow-hidden"
        firstChild={<ChatInterface isRightPanelVisible={isRightPanelVisible} />}
        secondChild={
          <Container
            className="h-full w-full"
            labels={[
              {
                label: "Changes",
                to: "",
                icon: <DiGit className="w-6 h-6" />,
              },
              {
                label: (
                  <div className="flex items-center gap-1">
                    {t(I18nKey.VSCODE$TITLE)}
                  </div>
                ),
                to: "vscode",
                icon: <VscCode className="w-5 h-5" />,
                rightContent: !RUNTIME_INACTIVE_STATES.includes(
                  curAgentState,
                ) ? (
                  <FaExternalLinkAlt
                    className="w-3 h-3 text-neutral-400 cursor-pointer"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (conversationId) {
                        try {
                          const data =
                            await OpenHands.getVSCodeUrl(conversationId);
                          if (data.vscode_url) {
                            const transformedUrl = transformVSCodeUrl(
                              data.vscode_url,
                            );
                            if (transformedUrl) {
                              window.open(transformedUrl, "_blank");
                            }
                          }
                        } catch (err) {
                          // Silently handle the error
                        }
                      }
                    }}
                  />
                ) : null,
              },
              {
                label: t(I18nKey.WORKSPACE$TERMINAL_TAB_LABEL),
                to: "terminal",
                icon: <TerminalIcon />,
              },
              // { label: "Jupyter", to: "jupyter", icon: <JupyterIcon /> },
              {
                label: <ServedAppLabel />,
                to: "served",
                icon: <FaServer />,
              },
              {
                label: (
                  <div className="flex items-center gap-1">
                    {t(I18nKey.BROWSER$TITLE)}
                  </div>
                ),
                to: "browser",
                icon: <GlobeIcon />,
              },
            ]}
          >
            {/* Use both Outlet and TabContent */}
            <div className="h-full w-full">
              <TabContent conversationPath={basePath} />
            </div>
          </Container>
        }
        isSecondPanelVisible={isRightPanelVisible}
        onSecondPanelToggle={handleDrawerToggle}
      />
    );
  }

  return (
    <WsClientProvider conversationId={conversationId}>
      <EventHandler>
        <div data-testid="app-route" className="flex flex-col h-full gap-3">
          <ConversationTopNav
            onShare={handleShare}
            onRun={handleRun}
            onDrawerToggle={handleDrawerToggle}
            onPositiveFeedback={() => onClickShareFeedbackActionButton("positive")}
            onNegativeFeedback={() => onClickShareFeedbackActionButton("negative")}
            onExportTrajectory={onClickExportTrajectoryButton}
          />
          <div className="flex h-full overflow-auto">{renderMain()}</div>

          <FeedbackModal
            isOpen={feedbackModalIsOpen}
            onClose={() => setFeedbackModalIsOpen(false)}
            polarity={feedbackPolarity}
          />
        </div>
      </EventHandler>
    </WsClientProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
