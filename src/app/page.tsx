import { JobDashboard } from "@/features/jobs/components/job-dashboard";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <JobDashboard />
      </main>
    </div>
  );
}
