"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Check, Clock, Flame } from "lucide-react";
import type { PollWithOptions, PollCategory } from "@/types";
import { getVisitorId } from "@/lib/visitor";
import { formatTimeLeft, formatVotes, getApiUrl } from "@/lib/utils";
import { ShareButton } from "./share-button";
import { AnimatedBar } from "./animated-bar";
import { BookmarkButton } from "./bookmark-button";
import { QRCodeButton } from "./qr-code";
import { useRealtimePoll } from "@/hooks";

interface PollDetailProps {
  poll: PollWithOptions;
}

const OPTION_COLORS = ["#3182F6", "#4A9EFF", "#7AB8FF", "#A8D1FF", "#D4E8FF"];

const CATEGORY_STYLES: Record<
  PollCategory,
  { bg: string; text: string; label: string }
> = {
  tech: { bg: "var(--category-tech)", text: "var(--category-tech-text)", label: "기술" },
  sports: { bg: "var(--category-sports)", text: "var(--category-sports-text)", label: "스포츠" },
  entertainment: { bg: "var(--category-entertainment)", text: "var(--category-entertainment-text)", label: "엔터" },
  politics: { bg: "var(--category-politics)", text: "var(--category-politics-text)", label: "정치" },
  lifestyle: { bg: "var(--category-lifestyle)", text: "var(--category-lifestyle-text)", label: "라이프" },
  business: { bg: "var(--category-tech)", text: "var(--category-tech-text)", label: "비즈니스" },
  other: { bg: "var(--bg-muted)", text: "var(--text-secondary)", label: "기타" },
};

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
  const categoryStyle = CATEGORY_STYLES[currentPoll.category as PollCategory] || CATEGORY_STYLES.other;

  // Check if user already voted
  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        const visitorId = getVisitorId();
        const response = await fetch(
          getApiUrl(`/api/polls/${poll.id}/vote?visitorId=${visitorId}`)
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
      const response = await fetch(getApiUrl(`/api/polls/${poll.id}/vote`), {
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link & Share */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
        >
          <ArrowLeft size={18} />
          돌아가기
        </Link>
        <div className="flex items-center gap-2">
          <BookmarkButton pollId={currentPoll.id} question={currentPoll.question} />
          <QRCodeButton pollId={currentPoll.id} question={currentPoll.question} />
          <ShareButton title={currentPoll.question} />
        </div>
      </div>

      {/* Badge & Meta */}
      <div className="flex items-center gap-3">
        {isActive ? (
          <span className="badge badge-hot">
            <Flame size={12} />
            진행중
          </span>
        ) : (
          <span className="badge" style={{ background: "var(--text-muted)", color: "white" }}>
            마감
          </span>
        )}
        <span
          className="badge"
          style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}
        >
          {categoryStyle.label}
        </span>
        {isActive && (
          <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
            <Clock size={14} />
            <span className="text-sm">{timeLeft}</span>
          </div>
        )}
      </div>

      {/* Question */}
      <h1 className="text-2xl md:text-[32px] font-bold text-[var(--text-primary)] leading-tight">
        {currentPoll.question}
      </h1>

      {/* Description */}
      {currentPoll.description && (
        <p className="text-[var(--text-secondary)]">{currentPoll.description}</p>
      )}

      {/* Participation Count */}
      <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
        <Users size={16} />
        <span className="text-sm font-medium">
          {formatVotes(currentPoll.total_votes)}명 참여
        </span>
      </div>

      {/* Poll Card */}
      <div className="card-toss p-6">
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
                className={`relative w-full overflow-hidden rounded-[var(--radius-md)] transition-all ${
                  isActive && !hasVoted
                    ? "cursor-pointer hover:scale-[1.01]"
                    : "cursor-default"
                } ${
                  isSelected && !hasVoted
                    ? "ring-2 ring-[var(--accent-blue)] ring-offset-2"
                    : ""
                }`}
              >
                {/* Background */}
                <div className="absolute inset-0 bg-[var(--bg-muted)]" />

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
                <div className="relative flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    {/* Radio/Check indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected || isVotedOption
                          ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]"
                          : "border-[var(--border-secondary)]"
                      }`}
                    >
                      {(isSelected || isVotedOption) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isSelected || isVotedOption
                          ? "text-[var(--accent-blue)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>
                  {showResults && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatVotes(option.votes)}표
                      </span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {option.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Vote Button */}
        {isActive && !hasVoted && !isCheckingVote ? (
          <button
            onClick={handleVote}
            disabled={!selectedOption || isSubmitting}
            className="w-full py-4 bg-[var(--accent-blue)] text-white text-base font-semibold rounded-[var(--radius-md)] shadow-[var(--shadow-button)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-[0_6px_20px_rgba(49,130,246,0.32)] transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            {isSubmitting ? "투표 중..." : "투표하기"}
          </button>
        ) : hasVoted ? (
          <div className="w-full py-4 bg-[var(--success)] text-white text-base font-semibold rounded-[var(--radius-md)] flex items-center justify-center gap-2">
            <Check size={20} />
            투표 완료
          </div>
        ) : null}
      </div>
    </div>
  );
}
