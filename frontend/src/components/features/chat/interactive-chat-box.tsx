import React from "react";
import { ChatInput } from "./chat-input";
import { cn } from "#/utils/utils";
import { ImageCarousel } from "../images/image-carousel";
import { UploadImageInput } from "../images/upload-image-input";
import { Pause } from "lucide-react";
import { Send } from "lucide-react";

interface InteractiveChatBoxProps {
  onSubmit: (content: string, files: File[]) => void;
  onStop?: () => void;
  isDisabled?: boolean;
  mode?: "submit" | "stop";
  value?: string;
  onChange?: (value: string) => void;
  isRightPanelVisible?: boolean;
}

export function InteractiveChatBox({
  onSubmit,
  onStop,
  isDisabled = false,
  mode = "submit",
  value,
  onChange,
  isRightPanelVisible = true,
}: InteractiveChatBoxProps) {
  const [images, setImages] = React.useState<File[]>([]);

  const handleUpload = (files: File[]) => {
    setImages((prev) => [...prev, ...files]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleUpload(files);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (value?.trim()) {
      onSubmit(value, images);
      setImages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="pb-2">
      <div className={`rounded-xl bg-base-secondary flex flex-col ${!isRightPanelVisible ? 'max-w-[700px] mx-auto' : ''}`}>
        <div className="flex items-center px-4 pt-3 pb-2">
          <label className="cursor-pointer mr-3 text-content-secondary hover:text-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="default-label">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.5 3.75C9.25736 3.75 8.25 4.75736 8.25 6V16.5C8.25 18.5711 9.92893 20.25 12 20.25C14.0711 20.25 15.75 18.5711 15.75 16.5V7H17.25V16.5C17.25 19.3995 14.8995 21.75 12 21.75C9.1005 21.75 6.75 19.3995 6.75 16.5V6C6.75 3.92893 8.42893 2.25 10.5 2.25C12.5711 2.25 14.25 3.92893 14.25 6V16C14.25 17.2426 13.2426 18.25 12 18.25C10.7574 18.25 9.75 17.2426 9.75 16V7H11.25V16C11.25 16.4142 11.5858 16.75 12 16.75C12.4142 16.75 12.75 16.4142 12.75 16V6C12.75 4.75736 11.7426 3.75 10.5 3.75Z" fill="white"></path>
            </svg>
            <input
              data-testid="upload-image-input"
              accept="image/*"
              multiple
              hidden
              type="file"
              onChange={handleImageUpload}
            />
          </label>
          <input
            placeholder="What do you want to build?"
            className="flex-1 bg-transparent text-content placeholder-content-secondary outline-none text-sm px-2"
            type="text"
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
          />
          <button
            className={cn(
              "ml-3 rounded-full w-8 h-8 flex items-center justify-center transition-colors",
              value?.trim()
                ? "bg-primary text-black hover:bg-primary/90"
                : "bg-white text-gray-400 hover:bg-gray-100"
            )}
            aria-label="Send"
            onClick={handleSubmit}
            disabled={isDisabled || !value?.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
            <span className="text-content text-xs">Server: Running</span>
          </div>
          <button className="flex items-center gap-1 bg-gray-200 rounded-full px-3 py-1 text-content font-medium text-xs focus:outline-none">
            <Pause className="w-4 h-4" />
            Pause Agent
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-2">
          <ImageCarousel
            size="small"
            images={images.map((image) => URL.createObjectURL(image))}
            onRemove={handleRemoveImage}
          />
        </div>
      )}
    </div>
  );
}
