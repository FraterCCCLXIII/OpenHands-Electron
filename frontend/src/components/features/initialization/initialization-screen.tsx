import React from "react";

interface InitializationScreenProps {
  title?: string;
  description?: string;
  statusItems?: Array<{
    label: string;
    status: "completed" | "in-progress" | "pending";
  }>;
}

export function InitializationScreen({
  title = "Initializing Project",
  description = "Setting up your development environment...",
  statusItems = [
    { label: "Environment setup", status: "completed" as const },
    { label: "Dependencies installed", status: "completed" as const },
    { label: "Starting development server...", status: "in-progress" as const },
  ],
}: InitializationScreenProps) {
  const getStatusIndicator = (status: "completed" | "in-progress" | "pending") => {
    switch (status) {
      case "completed":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case "in-progress":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>;
      case "pending":
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-content mb-2">{title}</h2>
          <p className="text-sm text-content-secondary">{description}</p>
        </div>
        <div className="space-y-3">
          {statusItems.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-base rounded-lg">
              {getStatusIndicator(item.status)}
              <span className="text-sm text-content">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
