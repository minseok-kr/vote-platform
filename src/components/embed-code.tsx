"use client";

import { useState } from "react";
import { Code, Copy, Check } from "lucide-react";

interface EmbedCodeProps {
  pollId: string;
  question: string;
}

export function EmbedCode({ pollId, question }: EmbedCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const embedUrl = `${baseUrl}/polls/${pollId}`;

  const iframeCode = `<iframe
  src="${embedUrl}?embed=true"
  width="100%"
  height="500"
  frameborder="0"
  style="border: 1px solid #e5e5e5; border-radius: 0;"
  title="${question}"
></iframe>`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = iframeCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors"
      >
        <Code size={16} />
        임베드
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-lg z-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                임베드 코드
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[var(--accent-blue)] hover:bg-[var(--bg-active)] transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    복사
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-[var(--bg-active)] text-xs text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap break-all">
              {iframeCode}
            </pre>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              웹사이트나 블로그에 이 코드를 붙여넣어 투표를 삽입하세요.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
