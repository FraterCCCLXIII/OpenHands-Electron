import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import AllHandsLogo from "#/assets/branding/all-hands-logo.svg?react";
import AllHandsLogoWhite from "#/assets/branding/all-hands-logo-white.svg?react";
import AllHands1 from "#/assets/branding/allhands-1.svg?react";
import AllHands2 from "#/assets/branding/allhands-2.svg?react";
import AllHands3 from "#/assets/branding/allhands-3.svg?react";
import AllHands4 from "#/assets/branding/allhands-4.svg?react";
import { cn } from "#/utils/utils";
import { useTheme } from "#/context/theme-context";

interface LogoPopoverButtonProps {
  className?: string;
}

interface PopoverCardProps {
  title: string;
  description: string;
  href: string;
  imageComponent: React.ComponentType<{ className?: string }>;
}

function PopoverCard({ title, description, href, imageComponent: ImageComponent }: PopoverCardProps) {
  const { theme } = useTheme();

  // Create specific color wrappers for each SVG
  const getColorWrapper = (component: React.ComponentType<any>) => {
    if (component === AllHands1) {
      return (
        <div className="[&_.st0]:fill-[#231f20] [&_.st1]:fill-[#f3e9e4] [&_.st2]:fill-[#fcde6c] [&_.st3]:fill-[#ea6e6c] [&_.st4]:fill-[#fdd749]">
          <ImageComponent className="w-full h-full" />
        </div>
      );
    } else if (component === AllHands2) {
      return (
        <div className="[&_.st0]:fill-[#cf7b6b] [&_.st1]:fill-[#231f20] [&_.st2]:fill-[#f9af8b] [&_.st3]:fill-[#c28e66] [&_.st4]:fill-[#fdd749]">
          <ImageComponent className="w-full h-full" />
        </div>
      );
    } else if (component === AllHands3) {
      return (
        <div className="[&_.st0]:fill-[#ef4650] [&_.st1]:fill-[#afb4b6] [&_.st2]:fill-[#fcde6c] [&_.st3]:fill-[#dfe1e1] [&_.st4]:fill-[#fdd749] [&_.st5]:fill-[#18171c]">
          <ImageComponent className="w-full h-full" />
        </div>
      );
    } else if (component === AllHands4) {
      return (
        <div className="[&_.st0]:fill-[#e7e7e5] [&_.st1]:fill-[#231f20] [&_.st2]:fill-[#afb4b6] [&_.st3]:fill-[#fff] [&_.st4]:fill-[#fdd749] [&_.st5]:fill-[#c3c5c4]">
          <ImageComponent className="w-full h-full" />
        </div>
      );
    }
    // Default wrapper for other components
    return <ImageComponent className="w-full h-full" />;
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block p-3 rounded-lg transition-colors duration-150 group min-w-[200px]",
        theme === "dark"
          ? "hover:bg-neutral-900"
          : "hover:bg-gray-100"
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
          {getColorWrapper(ImageComponent)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-content group-hover:text-content-secondary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-content-secondary mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
}

export function LogoPopoverButton({ className }: LogoPopoverButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();

  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Set a delay before closing to allow mouse to move to popover
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // 150ms delay is standard practice
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const cards: PopoverCardProps[] = [
    {
      title: "About AllHands",
      description: "Learn about our mission to democratize AI-powered software development and our journey so far.",
      href: "https://all-hands.dev",
      imageComponent: AllHands1,
    },
    {
      title: "Community",
      description: "Join thousands of developers in our Slack and Discord communities. Share ideas, get help, and contribute.",
      href: "https://join.slack.com/t/openhands-ai/shared_invite/zt-34zm4j0gj-Qz5kRHoca8DFCbqXPS~f_A",
      imageComponent: AllHands2,
    },
    {
      title: "Join Team",
      description: "We're hiring! Join our team of engineers, researchers, and designers building the future of AI development.",
      href: "https://all-hands.dev/careers",
      imageComponent: AllHands3,
    },
    {
      title: "Learning Center",
      description: "Explore tutorials, guides, and resources to master AI-powered development with OpenHands.",
      href: "https://docs.all-hands.dev",
      imageComponent: AllHands4,
    },
  ];

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-start"
      showArrow={false}
    >
      <PopoverTrigger>
        <button
          type="button"
          aria-label="AllHands Logo Menu"
          className={cn(
            "relative group transition-all duration-300",
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative">
            {theme === "dark" ? (
              <AllHandsLogoWhite
                width={34}
                height={34}
                className={cn(
                  "transition-all duration-300",
                  isOpen && "animate-logo-jump"
                )}
              />
            ) : (
              <AllHandsLogo
                width={34}
                height={34}
                className={cn(
                  "transition-all duration-300",
                  isOpen && "animate-logo-jump"
                )}
              />
            )}
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto max-w-4xl p-4 bg-base border border-border rounded-xl shadow-xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex gap-3 overflow-x-auto pb-2">
          {cards.map((card, index) => (
            <PopoverCard
              key={index}
              title={card.title}
              description={card.description}
              href={card.href}
              imageComponent={card.imageComponent}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
