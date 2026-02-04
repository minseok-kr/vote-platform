"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Check, Clock } from "lucide-react";
import type { PollWithOptions } from "@/types";
import { getVisitorId } from "@/lib/visitor";
import { formatTimeLeft, formatVotes } from "@/lib/utils";
import { ShareButton } from "./share-button";
import { AnimatedBar } from "./animated-bar";
import { BookmarkButton } from "./bookmark-button";
import { QRCodeButton } from "./qr-code";
import { useRealtimePoll } from "@/hooks";

interface PollDetailProps {
  poll: PollWithOptions;
}

const OPTION_COLORS = ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"];

export function PollDetail({ poll }: PollDetailProps) {
  // Use realtime updates for the poll
  const realtimePoll = useRealtimePoll(poll);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingVote, setIsCheckingVote] = useState(true);

  // Use realtime poll data
  const currentPoll = realtimePoll;

  // Check if user already voted
  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        const visitorId = getVisitorId();
        const response = await fetch(
          `/api/polls/${poll.id}/vote?visitorId=${visitorId}`
        );
        const result = await response.json();
        if (result.hasVoted) {
          setHasVoted(true);
          setVotedOptionId(result.votedOptionId);
          setSelectedOption(result.votedOptionId);
        }
      } catch (error) {
        // Ignore errors
      } finally {
        setIsCheckingVote(false);
      }
    };

    checkVoteStatus();
  }, [poll.id]);

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
        setVotedOptionId(selectedOption);
        // Realtime hook will automatically update the poll data
      }
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeLeft = formatTimeLeft(currentPoll.expires_at);
  const isExpired = currentPoll.expires_at
    ? new Date(currentPoll.expires_at) < new Date()
    : false;
  const isActive = currentPoll.status === "active" && !isExpired;

  return (
    <div className="space-y-6">
      {/* Back Link & Share */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          돌아가기
        </Link>
        <div className="flex items-center gap-2">
          <BookmarkButton pollId={currentPoll.id} question={currentPoll.question} />
          <QRCodeButton pollId={currentPoll.id} question={currentPoll.question} />
          <ShareButton title={currentPoll.question} />
        </div>
      </div>

      {/* Poll Card */}
      <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-primary)]">
        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          {isActive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--accent-blue)]">
              <Clock size={12} className="text-white" />
              <span className="text-[10px] font-semibold text-white tracking-wider">
                {timeLeft}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--text-muted)]">
              <span className="text-[10px] font-semibold text-white tracking-wider">
                CLOSED
              </span>
            </div>
          )}
          <span className="text-xs font-medium text-[var(--text-muted)] capitalize">
            {currentPoll.category}
          </span>
        </div>

        {/* Question */}
        <h1 className="font-display text-[32px] font-medium text-[var(--text-primary)] mb-3">
          {currentPoll.question}
        </h1>

        {currentPoll.description && (
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {currentPoll.description}
          </p>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentPoll.options.map((option, index) => {
            const color = OPTION_COLORS[index % OPTION_COLORS.length];
            const isSelected = selectedOption === option.id;
            const isVotedOption = votedOptionId === option.id;
            const showResults = hasVoted || !isActive || isCheckingVote;

            return (
              <button
                key={option.id}
                onClick={() =>
                  isActive && !hasVoted && setSelectedOption(option.id)
                }
                disabled={hasVoted || !isActive}
                className={`relative w-full h-14 bg-[var(--bg-active)] text-left transition-all ${
                  isActive && !hasVoted
                    ? "hover:bg-[var(--bg-card)] cursor-pointer"
                    : "cursor-default"
                } ${isSelected && !hasVoted ? "ring-2 ring-[var(--accent-blue)]" : ""}`}
              >
                {/* Progress Bar */}
                {showResults && (
                  <AnimatedBar
                    percentage={option.percentage}
                    color={color}
                    delay={index * 100}
                    animate={hasVoted && !isCheckingVote}
                  />
                )}
                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    {isVotedOption && (
                      <Check size={18} className="text-white" />
                    )}
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {option.text}
                    </span>
                  </div>
                  {showResults && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatVotes(option.votes)}표
                      </span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {option.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-[var(--text-muted)]" />
            <span className="text-[13px] font-medium text-[var(--text-secondary)]">
              {formatVotes(currentPoll.total_votes)}명 참여
            </span>
          </div>

          {isActive && !hasVoted && !isCheckingVote ? (
            <button
              onClick={handleVote}
              disabled={!selectedOption || isSubmitting}
              className="px-8 py-3.5 bg-[var(--accent-blue)] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "투표 중..." : "투표하기"}
            </button>
          ) : hasVoted ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--success)] text-white text-sm font-medium">
              <Check size={16} />
              투표 완료
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
