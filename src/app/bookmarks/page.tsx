import { BookmarkedPolls } from "@/components/bookmarked-polls";

export const metadata = {
  title: "저장된 투표 | Vote",
  description: "북마크한 투표 목록을 확인하세요",
};

export default function BookmarksPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-[var(--text-primary)] mb-8">
          저장된 투표
        </h1>

        <BookmarkedPolls />
      </div>
    </main>
  );
}
