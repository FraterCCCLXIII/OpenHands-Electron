import React from "react";
import { useLocation } from "react-router";
import { FaChartBar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { TooltipButton } from "./tooltip-button";
import { cn } from "#/utils/utils";

interface ConvoDashButtonProps {
  disabled?: boolean;
}

export function ConvoDashButton({ disabled = false }: ConvoDashButtonProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const isActive = location.pathname === "/convo-dash";

  const handleClick = () => {
    if (!disabled) {
      window.location.href = "/convo-dash";
    }
  };

  return (
    <TooltipButton
      testId="convo-dash-button"
      tooltip="Conversation Dashboard"
      ariaLabel="Conversation Dashboard"
      onClick={handleClick}
      disabled={disabled}
    >
      <FaChartBar
        size={22}
        className={cn(
          isActive ? "text-white" : "text-[#9099AC]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
    </TooltipButton>
  );
}
