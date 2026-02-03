"use client";

import { useState } from "react";
import { TrendingUp, Users, Check } from "lucide-react";
import type { PollWithOptions } from "@/types";
import { getVisitorId } from "@/lib/visitor";
import { formatTimeLeft, formatVotes } from "@/lib/utils";

interface FeaturedPollProps {
  poll: PollWithOptions;
}

const OPTION_COLORS = ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"];

export function FeaturedPoll({ poll }: FeaturedPollProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(poll);

  const handleVote = async () => {
    if (!selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const visitorId = getVisitorId();
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId: selectedOption,
          visitorId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setHasVoted(true);
        if (result.data) {
          setCurrentPoll(result.data);
        }
      }
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeLeft = formatTimeLeft(currentPoll.expires_at);

  return (
    <section className="p-8 bg-[var(--bg-card)] border border-[var(--border-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--accent-blue)]">
          <TrendingUp size={12} className="text-white" />
          <span className="text-[10px] font-semibold text-white tracking-wider">
            TRENDING
          </span>
        </div>
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {timeLeft}
        </span>
      </div>

      {/* Question */}
      <h2 className="font-display text-[28px] font-medium text-[var(--text-primary)] mb-6">
        {currentPoll.question}
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentPoll.options.map((option, index) => {
          const color = OPTION_COLORS[index % OPTION_COLORS.length];
          const isSelected = selectedOption === option.id;
          const showResults = hasVoted;

          return (
            <button
              key={option.id}
              onClick={() => !hasVoted && setSelectedOption(option.id)}
              disabled={hasVoted}
              className={`relative w-full h-12 bg-[var(--bg-active)] text-left transition-all ${
                !hasVoted
                  ? "hover:bg-[var(--bg-card)] cursor-pointer"
                  : "cursor-default"
              } ${isSelected && !hasVoted ? "ring-2 ring-[var(--accent-blue)]" : ""}`}
            >
              {/* Progress Bar */}
              {showResults && (
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500"
                  style={{
                    width: `${option.percentage}%`,
                    backgroundColor: color,
                  }}
                />
              )}
              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  {isSelected && hasVoted && (
                    <Check size={16} className="text-white" />
                  )}
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {option.text}
                  </span>
                </div>
                {showResults && (
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {option.percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users size={16} className="text-[var(--text-muted)]" />
          <span className="text-[13px] font-medium text-[var(--text-secondary)]">
            {formatVotes(currentPoll.total_votes)}명 참여
          </span>
        </div>
        {!hasVoted ? (
          <button
            onClick={handleVote}
            disabled={!selectedOption || isSubmitting}
            className="px-8 py-3.5 bg-[var(--accent-blue)] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "투표 중..." : "투표하기"}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--success)] text-white text-sm font-medium">
            <Check size={16} />
            투표 완료
          </div>
        )}
      </div>
    </section>
  );
}
