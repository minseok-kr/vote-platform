import Link from "next/link";
import { Header } from "@/components/header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="px-4 sm:px-6 md:px-10 lg:px-14 py-12">
        <div className="max-w-md mx-auto text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-[var(--bg-card)] border border-[var(--border-primary)] flex items-center justify-center">
              <span className="font-display text-5xl font-medium text-[var(--text-muted)]">
                404
              </span>
            </div>
          </div>

          {/* Text */}
          <h1 className="font-display text-3xl font-medium text-[var(--text-primary)] mb-3">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-[var(--accent-blue)] text-white text-sm font-semibold"
            >
              홈으로 돌아가기
            </Link>
            <Link
              href="/search"
              className="w-full sm:w-auto px-6 py-3 border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm font-medium hover:border-[var(--border-secondary)] transition-colors"
            >
              투표 검색하기
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
