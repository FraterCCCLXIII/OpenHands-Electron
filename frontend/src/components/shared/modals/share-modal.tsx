import React, { useState } from "react";
import { BaseModal } from "./base-modal/base-modal";
import { CopyToClipboardButton } from "../buttons/copy-to-clipboard-button";
import { FaSlack, FaGithub, FaEnvelope, FaWhatsapp, FaFacebook } from "react-icons/fa";
import { X } from "lucide-react";
import { Tooltip } from "@heroui/react";
import { useTranslation } from "react-i18next";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export function ShareModal({ isOpen, onClose, shareUrl }: ShareModalProps) {
  const { t } = useTranslation();
  const [copyMode, setCopyMode] = useState<"copy" | "copied">("copy");

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopyMode("copied");
    setTimeout(() => setCopyMode("copy"), 1500);
  };

  // Social share handlers (replace with actual logic as needed)
  const handleShare = (platform: string) => {
    // Implement platform-specific sharing logic here
    window.open(shareUrl, "_blank");
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title=""
      contentClassName="max-w-md p-0 bg-base-secondary rounded-xl shadow-xl"
      bodyClassName="px-8 py-6"
      isDismissable
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-base-tertiary focus:outline-none"
        aria-label={t("CONFIGURATION$MODAL_CLOSE_BUTTON_LABEL")}
        onClick={onClose}
      >
        <X className="w-5 h-5 text-content-secondary" />
      </button>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-content mb-2">{t("SHARE_MODAL$TITLE")}</h3>
          <p className="text-sm text-content-secondary">{t("SHARE_MODAL$DESCRIPTION")}</p>
        </div>
        <div className="mb-2">
          <label className="block text-xs text-content-secondary mb-1">{t("SHARE_MODAL$SHARE_LINK_LABEL")}</label>
          <div className="relative">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full rounded-lg bg-base px-4 py-2 pr-10 text-content text-sm border border-border focus:outline-none"
              aria-label={t("SHARE_MODAL$SHARE_LINK_LABEL")}
            />
            <button
              data-testid="copy-to-clipboard"
              type="button"
              onClick={handleCopy}
              aria-label={t("SHARE_MODAL$COPY_TO_CLIPBOARD")}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center hover:bg-base-tertiary rounded transition-colors"
            >
              {copyMode === "copy" ? (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.25 2.5C1.25 1.80964 1.80964 1.25 2.5 1.25H8.75C9.44036 1.25 10 1.80964 10 2.5V5H12.5C13.1904 5 13.75 5.55964 13.75 6.25V12.5C13.75 13.1904 13.1904 13.75 12.5 13.75H6.25C5.55964 13.75 5 13.1904 5 12.5V10H2.5C1.80964 10 1.25 9.44036 1.25 8.75V2.5ZM6.25 10V12.5H12.5V6.25H10V8.75C10 9.44036 9.44036 10 8.75 10H6.25ZM8.75 8.75V2.5L2.5 2.5V8.75H8.75Z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
          {copyMode === "copied" && (
            <p className="text-xs text-green-500 mt-1">{t("SHARE_MODAL$COPIED_TO_CLIPBOARD")}</p>
          )}
        </div>
        <div className="flex justify-center gap-4 pb-8">
          <Tooltip content={t("SHARE_MODAL$SHARE_TO_SLACK")} placement="bottom" closeDelay={100}>
            <button
              className="rounded-full bg-[#611f69] hover:bg-[#7b2fa0] w-12 h-12 flex items-center justify-center"
              aria-label={t("SHARE_MODAL$SHARE_TO_SLACK")}
              onClick={() => handleShare("slack")}
            >
              <FaSlack className="w-6 h-6 text-white" />
            </button>
          </Tooltip>
          <Tooltip content={t("SHARE_MODAL$SHARE_TO_GITHUB")} placement="bottom" closeDelay={100}>
            <button
              className="rounded-full bg-[#6f42c1] hover:bg-[#5a32a3] w-12 h-12 flex items-center justify-center"
              aria-label={t("SHARE_MODAL$SHARE_TO_GITHUB")}
              onClick={() => handleShare("github")}
            >
              <FaGithub className="w-6 h-6 text-white" />
            </button>
          </Tooltip>
          <Tooltip content={t("SHARE_MODAL$SHARE_VIA_EMAIL")} placement="bottom" closeDelay={100}>
            <button
              className="rounded-full bg-[#ea4335] hover:bg-[#d93025] w-12 h-12 flex items-center justify-center"
              aria-label={t("SHARE_MODAL$SHARE_VIA_EMAIL")}
              onClick={() => handleShare("email")}
            >
              <FaEnvelope className="w-6 h-6 text-white" />
            </button>
          </Tooltip>
          <Tooltip content={t("SHARE_MODAL$SHARE_TO_WHATSAPP")} placement="bottom" closeDelay={100}>
            <button
              className="rounded-full bg-[#25d366] hover:bg-[#128c7e] w-12 h-12 flex items-center justify-center"
              aria-label={t("SHARE_MODAL$SHARE_TO_WHATSAPP")}
              onClick={() => handleShare("whatsapp")}
            >
              <FaWhatsapp className="w-6 h-6 text-white" />
            </button>
          </Tooltip>
          <Tooltip content={t("SHARE_MODAL$SHARE_TO_TWITTER")} placement="bottom" closeDelay={100}>
            <button
              className="rounded-full bg-base-tertiary hover:bg-base w-12 h-12 flex items-center justify-center"
              aria-label={t("SHARE_MODAL$SHARE_TO_TWITTER")}
              onClick={() => handleShare("twitter")}
            >
              <X className="w-6 h-6 text-content-secondary" />
            </button>
          </Tooltip>
          <Tooltip content={t("SHARE_MODAL$SHARE_TO_FACEBOOK")} placement="bottom" closeDelay={100}>
            <button
              className="rounded-full bg-[#1877f3] hover:bg-[#145db2] w-12 h-12 flex items-center justify-center"
              aria-label={t("SHARE_MODAL$SHARE_TO_FACEBOOK")}
              onClick={() => handleShare("facebook")}
            >
              <FaFacebook className="w-6 h-6 text-white" />
            </button>
          </Tooltip>
        </div>
      </div>
    </BaseModal>
  );
}
