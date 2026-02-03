"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownProps {
  expiresAt: string;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function Countdown({ expiresAt, onExpire }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (!timeLeft) return null;

  if (timeLeft.total <= 0) {
    return (
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Clock size={16} />
        <span className="text-sm font-medium">마감됨</span>
      </div>
    );
  }

  // Show detailed countdown if less than 24 hours
  if (timeLeft.days === 0) {
    return (
      <div className="flex items-center gap-3">
        <Clock size={16} className="text-[var(--accent-blue)]" />
        <div className="flex items-center gap-1">
          <TimeUnit value={timeLeft.hours} label="시간" />
          <span className="text-[var(--text-muted)]">:</span>
          <TimeUnit value={timeLeft.minutes} label="분" />
          <span className="text-[var(--text-muted)]">:</span>
          <TimeUnit value={timeLeft.seconds} label="초" />
        </div>
      </div>
    );
  }

  // Show days + hours if more than 24 hours
  return (
    <div className="flex items-center gap-3">
      <Clock size={16} className="text-[var(--accent-blue)]" />
      <div className="flex items-center gap-2">
        <TimeUnit value={timeLeft.days} label="일" />
        <TimeUnit value={timeLeft.hours} label="시간" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-0.5">
      <span className="text-lg font-semibold text-[var(--text-primary)] tabular-nums">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
    </div>
  );
}
