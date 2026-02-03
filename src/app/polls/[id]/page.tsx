import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { PollDetail } from "@/components/poll-detail";
import { getPoll } from "@/lib/polls";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const poll = await getPoll(id).catch(() => null);

  if (!poll) {
    return {
      title: "투표를 찾을 수 없습니다",
    };
  }

  return {
    title: poll.question,
    description: poll.description || `${poll.total_votes}명이 참여한 투표`,
    openGraph: {
      title: poll.question,
      description: poll.description || `${poll.total_votes}명이 참여한 투표`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: poll.question,
      description: poll.description || `${poll.total_votes}명이 참여한 투표`,
    },
  };
}

export default async function PollPage({ params }: PageProps) {
  const { id } = await params;

  const poll = await getPoll(id).catch(() => null);

  if (!poll) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="px-4 sm:px-6 md:px-10 lg:px-14 py-12 max-w-3xl mx-auto">
        <PollDetail poll={poll} />
      </main>
    </div>
  );
}
