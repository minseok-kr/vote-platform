"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, Users, Vote, TrendingUp, Loader2 } from "lucide-react";

interface Stats {
  totalPolls: number;
  activePolls: number;
  completedPolls: number;
  totalVotes: number;
  recentVotes: number;
  categoryCounts: Record<string, number>;
  topPolls: { id: string; question: string; total_votes: number }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  tech: "기술",
  sports: "스포츠",
  entertainment: "엔터테인먼트",
  politics: "정치",
  lifestyle: "라이프스타일",
  business: "비즈니스",
  other: "기타",
};

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[var(--accent-blue)]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        통계를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-[32px] font-medium text-[var(--text-primary)]">
        플랫폼 통계
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Vote size={20} />}
          label="전체 투표"
          value={stats.totalPolls}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="진행중"
          value={stats.activePolls}
          color="blue"
        />
        <StatCard
          icon={<Users size={20} />}
          label="총 참여"
          value={stats.totalVotes}
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="24시간 참여"
          value={stats.recentVotes}
          color="green"
        />
      </div>

      {/* Category Distribution */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-primary)]">
        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">
          카테고리별 분포
        </h2>
        <div className="space-y-3">
          {Object.entries(stats.categoryCounts).map(([category, count]) => {
            const percentage = stats.totalPolls > 0
              ? Math.round((count / stats.totalPolls) * 100)
              : 0;

            return (
              <div key={category} className="flex items-center gap-4">
                <span className="w-24 text-sm text-[var(--text-secondary)]">
                  {CATEGORY_LABELS[category] || category}
                </span>
                <div className="flex-1 h-6 bg-[var(--bg-active)] relative">
                  <div
                    className="h-full bg-[var(--accent-blue)] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-16 text-right text-sm font-medium text-[var(--text-primary)]">
                  {count}개 ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Polls */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-primary)]">
        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-4">
          인기 투표 Top 5
        </h2>
        <div className="space-y-3">
          {stats.topPolls.map((poll, index) => (
            <Link
              key={poll.id}
              href={`/polls/${poll.id}`}
              className="flex items-center gap-4 p-3 hover:bg-[var(--bg-active)] transition-colors"
            >
              <span className="w-8 h-8 flex items-center justify-center bg-[var(--accent-blue)] text-white text-sm font-bold">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-[var(--text-primary)] line-clamp-1">
                {poll.question}
              </span>
              <span className="text-sm font-medium text-[var(--accent-blue)]">
                {poll.total_votes.toLocaleString()}표
              </span>
            </Link>
          ))}
          {stats.topPolls.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">
              아직 투표가 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: "default" | "blue" | "green";
}) {
  const colorClasses = {
    default: "text-[var(--text-muted)]",
    blue: "text-[var(--accent-blue)]",
    green: "text-[var(--success)]",
  };

  return (
    <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-primary)]">
      <div className={`mb-2 ${colorClasses[color]}`}>{icon}</div>
      <div className="text-2xl font-semibold text-[var(--text-primary)]">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
}
