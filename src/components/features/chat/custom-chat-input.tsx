import React, { useEffect, useRef } from "react";
import { useChatInputLogic } from "#/hooks/chat/use-chat-input-logic";
import { useFileHandling } from "#/hooks/chat/use-file-handling";
import { useGripResize } from "#/hooks/chat/use-grip-resize";
import { useChatInputEvents } from "#/hooks/chat/use-chat-input-events";
import { useChatSubmission } from "#/hooks/chat/use-chat-submission";
import { useSlashCommand } from "#/hooks/chat/use-slash-command";
import { ChatInputGrip } from "./components/chat-input-grip";
import { ChatInputContainer } from "./components/chat-input-container";
import { HiddenFileInput } from "./components/hidden-file-input";
import { useConversationStore } from "#/stores/conversation-store";
import { cn } from "#/utils/utils";

export interface CustomChatInputProps {
  disabled?: boolean;
  isNewConversationPending?: boolean;
  hasStartedConversation?: boolean;
  showButton?: boolean;
  onSubmit: (message: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onFilesPaste?: (
    files: File[],
    options?: import("#/hooks/chat/use-chat-attachment-upload").ChatAttachmentUploadOptions,
  ) => void;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
  buttonClassName?: React.HTMLAttributes<HTMLButtonElement>["className"];
  allowEmptySubmit?: boolean;
  placeholder?: string;
  composerDrawer?: React.ReactNode;
}

export function CustomChatInput({
  disabled = false,
  isNewConversationPending = false,
  hasStartedConversation,
  showButton = true,
  onSubmit,
  onFocus,
  onBlur,
  onFilesPaste,
  className = "",
  buttonClassName = "",
  allowEmptySubmit = false,
  placeholder,
  composerDrawer,
}: CustomChatInputProps) {
  const [canSubmit, setCanSubmit] = React.useState(false);
  const {
    submittedMessage,
    clearAllFiles,
    setShouldHideSuggestions,
    setSubmittedMessage,
    images,
    files,
  } = useConversationStore();

  // Note: we intentionally do NOT disable the input when the conversation is
  // in an ERROR/STUCK execution state. Users should be able to send a follow-up
  // message to recover the conversation; the message will be delivered
  // immediately via the WebSocket if connected, or queued via REST otherwise.
  const isDisabled = disabled;

  // Always call the latest `onSubmit` without making the effect re-run when
  // its identity changes. `onSubmit` (typically `handleSendMessage`) is a
  // fresh function on every parent render, and the parent re-renders
  // whenever the pending-message queue updates synchronously inside
  // `onSubmit` itself. Listing it in the dep array caused the effect to
  // fire twice — once for the original submit and again from the
  // mid-submit re-render, before `setSubmittedMessage(null)` was applied —
  // producing a duplicate "Sending…" bubble.
  const onSubmitRef = useRef(onSubmit);
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  // Listen to submittedMessage state changes
  useEffect(() => {
    if (!submittedMessage || disabled) {
      return;
    }
    onSubmitRef.current(submittedMessage);
    setSubmittedMessage(null);
  }, [submittedMessage, disabled, setSubmittedMessage]);

  // Custom hooks
  const {
    chatInputRef,
    messageToSend,
    checkIsContentEmpty,
    clearEmptyContentHandler,
    saveDraft,
  } = useChatInputLogic();

  const syncCanSubmit = React.useCallback(() => {
    const text = chatInputRef.current?.innerText ?? "";
    const hasAttachments = images.length > 0 || files.length > 0;
    setCanSubmit(allowEmptySubmit || text.trim().length > 0 || hasAttachments);
  }, [allowEmptySubmit, chatInputRef, images, files]);

  const {
    fileInputRef,
    chatContainerRef,
    isDragOver,
    handleFileIconClick,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useFileHandling(onFilesPaste);

  const {
    gripRef,
    isGripVisible,
    isGripDragging,
    canResize,
    handleTopEdgeClick,
    smartResize,
    handleGripMouseDown,
    handleGripTouchStart,
    increaseHeightForEmptyContent,
    resetManualResize,
  } = useGripResize(
    chatInputRef as React.RefObject<HTMLDivElement | null>,
    messageToSend,
  );

  const { handleSubmit } = useChatSubmission(
    chatInputRef as React.RefObject<HTMLDivElement | null>,
    fileInputRef as React.RefObject<HTMLInputElement | null>,
    smartResize,
    onSubmit,
    resetManualResize,
  );
  const handleSubmitAndSync = React.useCallback(() => {
    handleSubmit();
    syncCanSubmit();
  }, [handleSubmit, syncCanSubmit]);

  const { handleInput, handlePaste, handleKeyDown, handleBlur, handleFocus } =
    useChatInputEvents(
      chatInputRef as React.RefObject<HTMLDivElement | null>,
      smartResize,
      increaseHeightForEmptyContent,
      checkIsContentEmpty,
      clearEmptyContentHandler,
      onFocus,
      onBlur,
    );

  const {
    isMenuOpen: isSlashMenuOpen,
    filteredItems: slashItems,
    selectedIndex: slashSelectedIndex,
    updateSlashMenu,
    selectItem: selectSlashItem,
    handleSlashKeyDown,
    closeMenu: closeSlashMenu,
  } = useSlashCommand(chatInputRef as React.RefObject<HTMLDivElement | null>);

  // Cleanup: reset suggestions visibility when component unmounts
  useEffect(
    () => () => {
      setShouldHideSuggestions(false);
      clearAllFiles();
    },
    [setShouldHideSuggestions, clearAllFiles],
  );
  useEffect(() => {
    syncCanSubmit();
  }, [syncCanSubmit, images.length, files.length]);

  const chatInputContainerProps = {
    chatContainerRef,
    isDragOver,
    disabled: isDisabled,
    canSubmit,
    hasStartedConversation,
    isNewConversationPending,
    showButton,
    buttonClassName,
    chatInputRef,
    handleFileIconClick,
    handleSubmit: handleSubmitAndSync,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onInput: () => {
      handleInput();
      updateSlashMenu();
      saveDraft();
      syncCanSubmit();
    },
    onPaste: handlePaste,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (handleSlashKeyDown(e)) return;
      handleKeyDown(e, isDisabled, handleSubmitAndSync);
    },
    onFocus: handleFocus,
    onBlur: () => {
      handleBlur();
      closeSlashMenu();
      syncCanSubmit();
    },
    isSlashMenuOpen,
    slashItems,
    slashSelectedIndex,
    onSlashSelect: selectSlashItem,
    placeholder,
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Hidden file input */}
      <HiddenFileInput
        fileInputRef={fileInputRef}
        onChange={handleFileInputChange}
      />

      {/* Container with grip */}
      <div className="relative w-full">
        <ChatInputGrip
          gripRef={gripRef}
          isGripVisible={isGripVisible}
          isGripDragging={isGripDragging}
          canResize={canResize}
          handleTopEdgeClick={handleTopEdgeClick}
          handleGripMouseDown={handleGripMouseDown}
          handleGripTouchStart={handleGripTouchStart}
        />

        {composerDrawer ? (
          <div data-testid="composer-drawer-stack" className="relative w-full">
            <div className="rounded-t-[15px] bg-[var(--oh-surface-raised)] pb-[15px]">
              {composerDrawer}
            </div>
            <div className="relative z-10 -mt-[15px]">
              <ChatInputContainer {...chatInputContainerProps} />
            </div>
          </div>
        ) : (
          <ChatInputContainer {...chatInputContainerProps} />
        )}
      </div>
    </div>
  );
}
