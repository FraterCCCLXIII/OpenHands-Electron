import React from "react";

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
  return (
    <div className={`flex flex-wrap gap-2 px-4 pb-4 ${!isRightPanelVisible ? 'max-w-[700px] mx-auto' : ''}`}>
      <button
        className="flex items-center gap-1 bg-base-secondary rounded-full px-4 py-1.5 text-content font-medium text-xs focus:outline-none"
        onClick={onProjectChange}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 3v12"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="6" cy="3" r="3"/>
          <circle cx="18" cy="6" r="3"/>
          <path d="M6 6h12"/>
        </svg>
        {projectName}
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <button
        className="flex items-center gap-1 bg-base-secondary rounded-full px-4 py-1.5 text-content font-medium text-xs focus:outline-none"
        onClick={onBranchChange}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 3v12"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="6" cy="3" r="3"/>
          <circle cx="18" cy="6" r="3"/>
          <path d="M6 6h12"/>
        </svg>
        {branchName}
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <button
        className="flex items-center gap-1 bg-base-secondary rounded-full px-4 py-1.5 text-content font-medium text-xs focus:outline-none"
        onClick={onPush}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 19V6M5 12l7-7 7 7"/>
        </svg>
        Push
      </button>

      <button
        className="flex items-center gap-1 bg-base-secondary rounded-full px-4 py-1.5 text-content font-medium text-xs focus:outline-none"
        onClick={onPull}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 5v13M19 12l-7 7-7-7"/>
        </svg>
        Pull
      </button>

      <button
        className="flex items-center gap-1 bg-base-secondary rounded-full px-4 py-1.5 text-content font-medium text-xs focus:outline-none"
        onClick={onCreatePR}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="6" cy="6" r="3"/>
          <circle cx="6" cy="18" r="3"/>
          <path d="M6 9v6m6-3h6"/>
        </svg>
        Create PR
      </button>
    </div>
  );
}
