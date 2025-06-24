import React, { useState, useRef, useEffect } from "react";
import { TestTube, GitPullRequest, FileText, Package } from "lucide-react";

interface GitControlsProps {
  projectName?: string;
  branchName?: string;
  onProjectChange?: () => void;
  onBranchChange?: () => void;
  onPush?: () => void;
  onPull?: () => void;
  onCreatePR?: () => void;
  isRightPanelVisible?: boolean;
}

export function GitControls({
  projectName = "My Project",
  branchName = "main",
  onProjectChange,
  onBranchChange,
  onPush,
  onPull,
  onCreatePR,
  isRightPanelVisible = true,
}: GitControlsProps) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const shouldTruncateProject = projectName.length > 5;
  const shouldTruncateBranch = branchName.length > 5;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const moreMenuItems = [
    { label: "Increase test coverage", icon: <TestTube className="w-4 h-4" />, action: () => console.log("Increase test coverage") },
    { label: "Auto-merge PRs", icon: <GitPullRequest className="w-4 h-4" />, action: () => console.log("Auto-merge PRs") },
    { label: "Fix README", icon: <FileText className="w-4 h-4" />, action: () => console.log("Fix README") },
    { label: "Clean dependencies", icon: <Package className="w-4 h-4" />, action: () => console.log("Clean dependencies") },
  ];

  return (
    <div className={`flex flex-nowrap gap-1 px-4 ${!isRightPanelVisible ? 'max-w-[700px] mx-auto' : ''}`}>
      <button
        className="flex items-center gap-1 bg-base-secondary rounded-full px-2 py-1.5 text-content font-medium text-xs focus:outline-none relative"
        onClick={onProjectChange}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 3v12"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="6" cy="3" r="3"/>
          <circle cx="18" cy="6" r="3"/>
          <path d="M6 6h12"/>
        </svg>
        <span
          className={`${shouldTruncateProject ? 'max-w-[60px] truncate' : ''}`}
          title={shouldTruncateProject ? projectName : undefined}
        >
          {projectName}
        </span>
        {shouldTruncateProject && (
          <div className="absolute right-6 top-0 bottom-0 w-4 bg-gradient-to-l from-base-secondary to-transparent pointer-events-none" />
        )}
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <button
        className="flex items-center gap-1 bg-base-secondary rounded-full px-2 py-1.5 text-content font-medium text-xs focus:outline-none relative"
        onClick={onBranchChange}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 3v12"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="6" cy="3" r="3"/>
          <circle cx="18" cy="6" r="3"/>
          <path d="M6 6h12"/>
        </svg>
        <span
          className={`${shouldTruncateBranch ? 'max-w-[60px] truncate' : ''}`}
          title={shouldTruncateBranch ? branchName : undefined}
        >
          {branchName}
        </span>
        {shouldTruncateBranch && (
          <div className="absolute right-6 top-0 bottom-0 w-4 bg-gradient-to-l from-base-secondary to-transparent pointer-events-none" />
        )}
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <button
        className="flex items-center gap-1 bg-base-secondary rounded-full px-2 py-1.5 text-content font-medium text-xs focus:outline-none"
        onClick={onPush}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 19V6M5 12l7-7 7 7"/>
        </svg>
        Push
      </button>

      <button
        className="flex items-center gap-1 bg-base-secondary rounded-full px-2 py-1.5 text-content font-medium text-xs focus:outline-none"
        onClick={onPull}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 5v13M19 12l-7 7-7-7"/>
        </svg>
        Pull
      </button>

      <button
        className="flex items-center gap-1 bg-base-secondary rounded-full px-2 py-1.5 text-content font-medium text-xs focus:outline-none"
        onClick={onCreatePR}
        aria-label="Create Pull Request"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
          <circle cx="6" cy="5" r="2" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="19" r="2" />
          <path d="M6 7v10M6 5h7a4 4 0 0 1 4 4v6" />
          <path d="M18 17l-3 2 3 2" />
        </svg>
        Create PR
      </button>

      {/* Three-dot more menu */}
      <div className="relative" ref={moreMenuRef}>
        <button
          data-testid="ellipsis-button"
          type="button"
          className="p-1 hover:bg-neutral-500 rounded transition-colors"
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          aria-label="More options"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 192 512"
            className="w-4 h-4 text-content-secondary"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z"></path>
          </svg>
        </button>

        {/* Dropdown menu */}
        {isMoreMenuOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-base border border-border rounded-lg shadow-lg z-50">
            <ul className="py-1">
              {moreMenuItems.map((item, index) => (
                <li key={index}>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-content hover:bg-tertiary flex items-center gap-2"
                    onClick={() => {
                      item.action();
                      setIsMoreMenuOpen(false);
                    }}
                  >
                    <span className="text-content-secondary">
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
