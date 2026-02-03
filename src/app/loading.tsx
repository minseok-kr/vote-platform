import { Header } from "@/components/header";
import {
  PollCardSkeleton,
  TrendingPollsSkeleton,
  AllPollsSkeleton,
} from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="px-4 sm:px-6 md:px-10 lg:px-14 py-6 md:py-12 space-y-8 md:space-y-12">
        <PollCardSkeleton />
        <TrendingPollsSkeleton />
        <AllPollsSkeleton />
      </main>
    </div>
  );
}
