import { Header } from "@/components/header";
import { PollDetailSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="px-4 sm:px-6 md:px-10 lg:px-14 py-12 max-w-3xl mx-auto">
        <PollDetailSkeleton />
      </main>
    </div>
  );
}
