import { Header } from "@/components/header";
import { StatsDashboard } from "@/components/stats-dashboard";

export const metadata = {
  title: "통계",
  description: "투표 플랫폼 통계 대시보드",
};

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="px-4 sm:px-6 md:px-10 lg:px-14 py-6 md:py-12">
        <StatsDashboard />
      </main>
    </div>
  );
}
