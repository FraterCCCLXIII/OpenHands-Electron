import React from "react";
import ReactDOM from "react-dom";

interface ConversationPanelWrapperProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function ConversationPanelWrapper({
  isOpen,
  onClose,
  children,
}: React.PropsWithChildren<ConversationPanelWrapperProps>) {
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsClosing(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, isClosing]);

  if (!isOpen && !isClosing) return null;

  const portalTarget = document.getElementById("root-outlet");
  if (!portalTarget) return null;

  // Add CSS keyframes for animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return ReactDOM.createPortal(
    <div
      className={`absolute h-full w-full left-0 top-0 z-20 bg-black/80 rounded-xl transition-all duration-300 ease-in-out ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        animation: isClosing ? 'none' : 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose ? () => onClose() : undefined}
    >
      {children}
    </div>,
    portalTarget,
  );
}
