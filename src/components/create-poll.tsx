"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import type { PollCategory } from "@/types";

const CATEGORIES: { value: PollCategory; label: string }[] = [
  { value: "tech", label: "기술" },
  { value: "sports", label: "스포츠" },
  { value: "entertainment", label: "엔터테인먼트" },
  { value: "politics", label: "정치" },
  { value: "lifestyle", label: "라이프스타일" },
  { value: "business", label: "비즈니스" },
  { value: "other", label: "기타" },
];

const DURATION_OPTIONS = [
  { value: 1, label: "1일" },
  { value: 3, label: "3일" },
  { value: 7, label: "1주" },
  { value: 14, label: "2주" },
  { value: 30, label: "1개월" },
];

export function CreatePoll() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PollCategory>("other");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!question.trim()) {
      setError("질문을 입력해주세요.");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      setError("최소 2개의 선택지를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);

      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          description: description.trim() || undefined,
          category,
          options: validOptions,
          expires_at: expiresAt.toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        router.push(`/polls/${result.data.id}`);
      } else {
        setError(result.error || "투표 생성에 실패했습니다.");
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[32px] font-medium text-[var(--text-primary)]">
          새 투표 만들기
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          질문과 선택지를 입력하여 새로운 투표를 생성하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Question */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-muted)] tracking-wider">
            질문 *
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="투표 질문을 입력하세요"
            maxLength={200}
            className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]"
          />
          <span className="text-xs text-[var(--text-muted)]">
            {question.length}/200
          </span>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-muted)] tracking-wider">
            설명 (선택)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="투표에 대한 추가 설명을 입력하세요"
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] resize-none"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-muted)] tracking-wider">
            카테고리
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                  category === cat.value
                    ? "bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--border-secondary)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[var(--text-muted)] tracking-wider">
            선택지 * (최소 2개, 최대 6개)
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`선택지 ${index + 1}`}
                maxLength={100}
                className="flex-1 px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="px-3 py-3 text-[var(--text-muted)] hover:text-red-500 border border-[var(--border-primary)] hover:border-red-300 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--accent-blue)] border border-dashed border-[var(--border-primary)] hover:border-[var(--accent-blue)] transition-colors w-full justify-center"
            >
              <Plus size={16} />
              선택지 추가
            </button>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-muted)] tracking-wider">
            투표 기간
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDuration(opt.value)}
                className={`px-4 py-2 text-xs font-medium border transition-colors ${
                  duration === opt.value
                    ? "bg-[var(--accent-blue)] text-white border-[var(--accent-blue)]"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--border-secondary)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[var(--border-primary)]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-4 bg-[var(--accent-blue)] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                생성 중...
              </>
            ) : (
              "투표 생성하기"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
