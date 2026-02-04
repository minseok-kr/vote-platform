"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Calendar, Tag } from "lucide-react";
import type { PollCategory } from "@/types";
import { getApiUrl } from "@/lib/utils";

const CATEGORIES: { value: PollCategory; label: string; color: string }[] = [
  { value: "tech", label: "기술", color: "var(--category-tech)" },
  { value: "sports", label: "스포츠", color: "var(--category-sports)" },
  { value: "entertainment", label: "엔터테인먼트", color: "var(--category-entertainment)" },
  { value: "politics", label: "정치", color: "var(--category-politics)" },
  { value: "lifestyle", label: "라이프스타일", color: "var(--category-lifestyle)" },
  { value: "business", label: "비즈니스", color: "var(--category-tech)" },
  { value: "other", label: "기타", color: "var(--bg-muted)" },
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

      const response = await fetch(getApiUrl("/api/polls"), {
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-[28px] font-bold text-[var(--text-primary)]">
          새 투표 만들기
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          질문과 선택지를 입력하여 새로운 투표를 생성하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-[var(--error-light)] rounded-[var(--radius-md)] text-[var(--error)] text-sm font-medium">
            {error}
          </div>
        )}

        {/* Question Card */}
        <div className="card-toss p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              질문 *
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="투표 질문을 입력하세요"
              maxLength={200}
              className="w-full px-4 py-3.5 bg-[var(--bg-muted)] rounded-[var(--radius-md)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
            />
            <span className="text-xs text-[var(--text-muted)]">
              {question.length}/200
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--text-primary)]">
              설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="투표에 대한 추가 설명을 입력하세요"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3.5 bg-[var(--bg-muted)] rounded-[var(--radius-md)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] resize-none transition-all"
            />
          </div>
        </div>

        {/* Category Card */}
        <div className="card-toss p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-[var(--text-secondary)]" />
            <label className="text-sm font-semibold text-[var(--text-primary)]">
              카테고리
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-full)] transition-all ${
                  category === cat.value
                    ? "bg-[var(--accent-blue)] text-white shadow-[var(--shadow-button)]"
                    : "bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-active)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options Card */}
        <div className="card-toss p-6 space-y-4">
          <label className="block text-sm font-semibold text-[var(--text-primary)]">
            선택지 * (최소 2개, 최대 6개)
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--accent-blue-light)] text-[var(--accent-blue)] text-xs font-semibold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`선택지 ${index + 1}`}
                    maxLength={100}
                    className="w-full pl-14 pr-4 py-3.5 bg-[var(--bg-muted)] rounded-[var(--radius-md)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
                  />
                </div>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="w-12 h-12 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--accent-blue)] bg-[var(--accent-blue-light)] rounded-[var(--radius-md)] hover:bg-[var(--bg-active)] transition-colors w-full justify-center"
            >
              <Plus size={18} />
              선택지 추가
            </button>
          )}
        </div>

        {/* Duration Card */}
        <div className="card-toss p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[var(--text-secondary)]" />
            <label className="text-sm font-semibold text-[var(--text-primary)]">
              투표 기간
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDuration(opt.value)}
                className={`px-5 py-2.5 text-sm font-medium rounded-[var(--radius-md)] transition-all ${
                  duration === opt.value
                    ? "bg-[var(--accent-blue)] text-white shadow-[var(--shadow-button)]"
                    : "bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-active)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[var(--accent-blue)] text-white text-base font-semibold rounded-[var(--radius-md)] shadow-[var(--shadow-button)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-[0_6px_20px_rgba(49,130,246,0.32)] transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              생성 중...
            </>
          ) : (
            "투표 생성하기"
          )}
        </button>
      </form>
    </div>
  );
}
