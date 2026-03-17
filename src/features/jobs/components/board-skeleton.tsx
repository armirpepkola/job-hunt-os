export function BoardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="h-26 w-full bg-zinc-200/50 rounded-xl animate-pulse shrink-0 border border-zinc-100" />
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-4 h-full min-w-max">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-80 flex flex-col bg-zinc-100 rounded-xl p-4 animate-pulse"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 w-24 bg-zinc-200 rounded" />
                <div className="h-6 w-8 bg-zinc-200 rounded-full" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-32 w-full bg-zinc-200/70 rounded-xl" />
                <div className="h-32 w-full bg-zinc-200/70 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
