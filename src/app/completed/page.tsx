import { Header } from "@/components/header";
import { CompletedPolls } from "@/components/completed-polls";
import { getPolls } from "@/lib/api";

export const revalidate = 60;

export default async function CompletedPollsPage() {
  const polls = await getPolls({ status: "completed", limit: 20 }).catch(() => []);

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="px-14 py-12">
        <CompletedPolls polls={polls} />
      </main>
    </div>
  );
}
