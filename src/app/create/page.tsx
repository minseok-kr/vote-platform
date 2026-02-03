import { Header } from "@/components/header";
import { CreatePoll } from "@/components/create-poll";

export default function CreatePollPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="px-14 py-12 max-w-2xl mx-auto">
        <CreatePoll />
      </main>
    </div>
  );
}
