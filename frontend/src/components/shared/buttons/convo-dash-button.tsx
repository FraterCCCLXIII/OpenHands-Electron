import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@nextui-org/react";
import { FaChartBar } from "react-icons/fa";

interface ConvoDashButtonProps {
  disabled?: boolean;
}

export function ConvoDashButton({ disabled = false }: ConvoDashButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === "/convo-dash";

  const handleClick = () => {
    if (!disabled) {
      navigate("/convo-dash");
    }
  };

  return (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      className={`min-w-[40px] h-[40px] ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-default-100"
      }`}
      onClick={handleClick}
      disabled={disabled}
      title="Conversation Dashboard"
    >
      <FaChartBar className="w-4 h-4" />
    </Button>
  );
}
