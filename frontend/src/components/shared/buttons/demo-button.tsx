import { useTranslation } from "react-i18next";
import ListIcon from "#/icons/list.svg?react";
import { TooltipButton } from "./tooltip-button";
import { cn } from "#/utils/utils";

interface DemoButtonProps {
  isOpen: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function DemoButton({
  isOpen,
  onClick,
  disabled = false,
}: DemoButtonProps) {
  const { t } = useTranslation();

  return (
    <TooltipButton
      testId="toggle-demo-panel"
      tooltip="Conversation List Demo"
      ariaLabel="Conversation List Demo"
      onClick={onClick}
      disabled={disabled}
    >
      <ListIcon
        width={24}
        height={24}
        className={cn(
          "cursor-pointer",
          isOpen ? "text-white" : "text-[#B1B9D3]",
          disabled && "opacity-50",
        )}
      />
    </TooltipButton>
  );
}
