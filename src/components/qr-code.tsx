"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, Download, X } from "lucide-react";

interface QRCodeProps {
  pollId: string;
  question: string;
}

export function QRCodeButton({ pollId, question }: QRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pollUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/polls/${pollId}`
      : "";

  // Generate QR code when modal opens
  useEffect(() => {
    if (!isOpen || !pollUrl) return;

    // Simple QR code generation using canvas
    generateQRCode(pollUrl).then(setQrDataUrl);
  }, [isOpen, pollUrl]);

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `poll-${pollId}-qr.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors"
      >
        <QrCode size={16} />
        QR
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm mx-4 bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                QR 코드
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center">
              {qrDataUrl ? (
                <div className="p-4 bg-white">
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${question}`}
                    className="w-48 h-48"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-[var(--bg-active)] animate-pulse" />
              )}

              <p className="mt-4 text-sm text-[var(--text-secondary)] text-center">
                이 QR 코드를 스캔하면 투표 페이지로 이동합니다
              </p>

              <button
                onClick={downloadQR}
                disabled={!qrDataUrl}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-[var(--accent-blue)] text-white text-sm font-medium disabled:opacity-50"
              >
                <Download size={16} />
                다운로드
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-active)]">
              <p className="text-xs text-[var(--text-muted)] text-center truncate">
                {pollUrl}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Simple QR code generator using canvas
async function generateQRCode(text: string): Promise<string> {
  // Use a simple API for QR code generation
  const size = 200;
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=10`;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      }
    };
    img.onerror = () => {
      // Fallback: return the URL directly
      resolve(url);
    };
    img.src = url;
  });
}
