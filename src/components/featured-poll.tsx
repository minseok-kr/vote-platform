"use client";

import { useState } from "react";
import { Flame, Users, Check, Clock } from "lucide-react";
import type { PollWithOptions } from "@/types";
import { getVisitorId } from "@/lib/visitor";
import { formatTimeLeft, formatVotes } from "@/lib/utils";

interface FeaturedPollProps {
  poll: PollWithOptions;
}

const OPTION_COLORS = ["#3182F6", "#4A9EFF", "#7AB8FF", "#A8D1FF", "#D4E8FF"];

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
    <section className="max-w-2xl mx-auto">
      {/* Badge & Meta */}
      <div className="flex items-center gap-3 mb-4">
        <span className="badge badge-hot">
          <Flame size={12} />
          HOT
        </span>
        <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
          <Clock size={14} />
          <span className="text-sm">{timeLeft}</span>
        </div>
      </div>

      {/* Question */}
      <h1 className="text-2xl md:text-[28px] font-bold text-[var(--text-primary)] leading-tight mb-2">
        {currentPoll.question}
      </h1>

      {/* Description */}
      {currentPoll.description && (
        <p className="text-[var(--text-secondary)] mb-4">
          {currentPoll.description}
        </p>
      )}

      {/* Participation Count */}
      <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] mb-6">
        <Users size={16} />
        <span className="text-sm font-medium">
          {formatVotes(currentPoll.total_votes)}명 참여중
        </span>
      </div>

      {/* Poll Card */}
      <div className="card-toss p-6">
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
                className={`relative w-full overflow-hidden rounded-[var(--radius-md)] transition-all ${
                  !hasVoted
                    ? "cursor-pointer hover:scale-[1.01]"
                    : "cursor-default"
                } ${
                  isSelected && !hasVoted
                    ? "ring-2 ring-[var(--accent-blue)] ring-offset-2"
                    : ""
                }`}
              >
                {/* Background */}
                <div
                  className={`absolute inset-0 transition-colors ${
                    showResults ? "bg-[var(--bg-muted)]" : "bg-[var(--bg-muted)]"
                  }`}
                />

                {/* Progress Bar */}
                {showResults && (
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
                    style={{
                      width: `${option.percentage}%`,
                      backgroundColor: color,
                      opacity: 0.2,
                    }}
                  />
                )}

                {/* Content */}
                <div className="relative flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    {/* Radio/Check indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]"
                          : "border-[var(--border-secondary)]"
                      }`}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isSelected
                          ? "text-[var(--accent-blue)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>
                  {showResults && (
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {option.percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Vote Button */}
        {!hasVoted ? (
          <button
            onClick={handleVote}
            disabled={!selectedOption || isSubmitting}
            className="w-full py-4 bg-[var(--accent-blue)] text-white text-base font-semibold rounded-[var(--radius-md)] shadow-[var(--shadow-button)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-[0_6px_20px_rgba(49,130,246,0.32)] transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            {isSubmitting ? "투표 중..." : "투표하기"}
          </button>
        ) : (
          <div className="w-full py-4 bg-[var(--success)] text-white text-base font-semibold rounded-[var(--radius-md)] flex items-center justify-center gap-2">
            <Check size={20} />
            투표 완료
          </div>
        )}
      </div>
    </section>
  );
}
