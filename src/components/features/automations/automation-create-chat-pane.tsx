import { Maximize2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChatInterfaceWrapper } from "#/components/features/conversation/conversation-main/chat-interface-wrapper";
import { ChatActionTooltip } from "#/components/features/chat/chat-action-tooltip";
import {
  NavigationProvider,
  useNavigation,
} from "#/context/navigation-context";
import { WebSocketProviderWrapper } from "#/contexts/websocket-provider-wrapper";
import { I18nKey } from "#/i18n/declaration";
import {
  mobileTopBarIconButtonClassName,
  mobileTopBarIconClassName,
} from "#/utils/mobile-top-bar-icon-button-classes";
import { EventHandler } from "#/wrapper/event-handler";

interface AutomationCreateChatPaneProps {
  conversationId: string;
  onClose: () => void;
}

export function AutomationCreateChatPane({
  conversationId,
  onClose,
}: AutomationCreateChatPaneProps) {
  const { t } = useTranslation("openhands");
  const navigation = useNavigation();
  const closeLabel = t(I18nKey.AUTOMATIONS$CREATE_DRAWER_CLOSE);
  const expandLabel = t(I18nKey.AUTOMATIONS$CREATE_DRAWER_OPEN_FULL_PAGE);

  const handleExpand = () => {
    navigation.navigate(`/conversations/${conversationId}`);
  };

  return (
    <section
      data-testid="automation-create-chat-pane"
      className="flex h-full min-h-0 flex-col border-l border-[var(--oh-border)] bg-base"
    >
      <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-[var(--oh-border)] px-3">
        <h2 className="min-w-0 truncate text-sm font-medium text-content">
          {t(I18nKey.AUTOMATIONS$ADD_AUTOMATION)}
        </h2>
        <div className="flex shrink-0 items-center">
          <ChatActionTooltip tooltip={expandLabel} ariaLabel={expandLabel}>
            <button
              type="button"
              data-testid="automation-create-chat-expand"
              onClick={handleExpand}
              aria-label={expandLabel}
              className={mobileTopBarIconButtonClassName}
            >
              <Maximize2 className={mobileTopBarIconClassName} aria-hidden />
            </button>
          </ChatActionTooltip>
          <ChatActionTooltip tooltip={closeLabel} ariaLabel={closeLabel}>
            <button
              type="button"
              data-testid="automation-create-chat-close"
              onClick={onClose}
              aria-label={closeLabel}
              className={mobileTopBarIconButtonClassName}
            >
              <X className={mobileTopBarIconClassName} aria-hidden />
            </button>
          </ChatActionTooltip>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        <NavigationProvider
          value={{
            ...navigation,
            conversationId,
          }}
        >
          <WebSocketProviderWrapper conversationId={conversationId}>
            <EventHandler>
              <ChatInterfaceWrapper
                isRightPanelShown={false}
                showGitControlBar={false}
              />
            </EventHandler>
          </WebSocketProviderWrapper>
        </NavigationProvider>
      </div>
    </section>
  );
}
