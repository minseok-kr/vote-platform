"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
  pollId: string;
}

export function ExportButton({ pollId }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/polls/${pollId}/export`);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `poll-${pollId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // Handle error
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors disabled:opacity-50"
    >
      {isExporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      CSV
    </button>
  );
}
