export default function PromptsLoading() {
  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded bg-neutral-200" />
        <div className="h-9 w-36 animate-pulse rounded-md bg-neutral-200" />
      </div>

      <div className="mt-8 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
              <div className="h-3 w-64 animate-pulse rounded bg-neutral-100" />
            </div>
            <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </main>
  );
}
