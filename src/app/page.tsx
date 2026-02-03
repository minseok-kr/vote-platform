import { Header } from "@/components/header";
import { FeaturedPoll } from "@/components/featured-poll";
import { TrendingPolls } from "@/components/trending-polls";
import { AllPolls } from "@/components/all-polls";
import { getFeaturedPoll, getTrendingPolls, getPolls } from "@/lib/polls";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // Fetch data in parallel
  const [featuredPoll, trendingPolls, allPolls] = await Promise.all([
    getFeaturedPoll().catch(() => null),
    getTrendingPolls(4).catch(() => []),
    getPolls({ status: "active", limit: 10 }).catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="px-4 sm:px-6 md:px-10 lg:px-14 py-6 md:py-12 space-y-8 md:space-y-12">
        {featuredPoll && <FeaturedPoll poll={featuredPoll} />}
        <TrendingPolls polls={trendingPolls} />
        <AllPolls polls={allPolls} />
      </main>
    </div>
  );
}
