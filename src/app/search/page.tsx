import { Header } from "@/components/header";
import { SearchPolls } from "@/components/search-polls";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <Header />
      <main className="px-14 py-12">
        <SearchPolls />
      </main>
    </div>
  );
}
