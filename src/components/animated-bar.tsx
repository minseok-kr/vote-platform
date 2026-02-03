"use client";

import { useEffect, useState } from "react";

interface AnimatedBarProps {
  percentage: number;
  color: string;
  delay?: number;
  animate?: boolean;
}

export function AnimatedBar({
  percentage,
  color,
  delay = 0,
  animate = true,
}: AnimatedBarProps) {
  const [width, setWidth] = useState(animate ? 0 : percentage);

  useEffect(() => {
    if (!animate) return;

    const timer = setTimeout(() => {
      setWidth(percentage);
    }, delay);

    return () => clearTimeout(timer);
  }, [percentage, delay, animate]);

  return (
    <div
      className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
      style={{
        width: `${width}%`,
        backgroundColor: color,
      }}
    />
  );
}
