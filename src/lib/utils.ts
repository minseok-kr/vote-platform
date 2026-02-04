// Time utilities
export function formatTimeLeft(expiresAt: string | null): string {
  if (!expiresAt) {
    return "무기한";
  }

  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff <= 0) {
    return "마감됨";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 7) {
    const weeks = Math.floor(days / 7);
    return `${weeks}주 남음`;
  }

  if (days > 0) {
    return `${days}일 남음`;
  }

  if (hours > 0) {
    return `${hours}시간 남음`;
  }

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes}분 남음`;
}

// Number formatting
export function formatVotes(votes: number): string {
  if (votes >= 1000000) {
    return `${(votes / 1000000).toFixed(1)}M`;
  }
  if (votes >= 1000) {
    return `${(votes / 1000).toFixed(1)}K`;
  }
  return votes.toLocaleString();
}

// Category display names
export const categoryLabels: Record<string, string> = {
  tech: "테크",
  sports: "스포츠",
  entertainment: "엔터테인먼트",
  politics: "정치",
  lifestyle: "라이프스타일",
  business: "비즈니스",
  other: "기타",
};

// Progress bar colors (gradient from dark to light blue)
export const optionColors = [
  "#2563EB", // Primary blue
  "#3B82F6",
  "#60A5FA",
  "#93C5FD",
  "#BFDBFE",
  "#DBEAFE",
];

export function getOptionColor(index: number): string {
  return optionColors[index % optionColors.length];
}
