"use client";

import { useState } from "react";
import { Share2, Link2, Twitter, Facebook, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url?: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title}\n\n`);
    const shareUrlEncoded = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${shareUrlEncoded}`,
      "_blank",
      "width=550,height=420"
    );
    setIsOpen(false);
  };

  const shareToFacebook = () => {
    const shareUrlEncoded = encodeURIComponent(shareUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`,
      "_blank",
      "width=550,height=420"
    );
    setIsOpen(false);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors"
      >
        <Share2 size={16} />
        공유
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-lg z-50">
            {/* Copy Link */}
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-active)] transition-colors"
            >
              {copied ? (
                <Check size={16} className="text-[var(--success)]" />
              ) : (
                <Link2 size={16} />
              )}
              {copied ? "복사됨!" : "링크 복사"}
            </button>

            {/* Twitter */}
            <button
              onClick={shareToTwitter}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-active)] transition-colors"
            >
              <Twitter size={16} />
              Twitter
            </button>

            {/* Facebook */}
            <button
              onClick={shareToFacebook}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-active)] transition-colors"
            >
              <Facebook size={16} />
              Facebook
            </button>

            {/* Native Share (Mobile) */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={nativeShare}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-active)] transition-colors border-t border-[var(--border-primary)]"
              >
                <Share2 size={16} />
                더보기...
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
