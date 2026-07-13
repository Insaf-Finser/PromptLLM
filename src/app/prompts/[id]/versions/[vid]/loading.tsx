export default function VersionDetailLoading() {
  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 h-32 animate-pulse rounded-xl bg-neutral-100" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl bg-neutral-100" />
        <div className="h-64 animate-pulse rounded-xl bg-neutral-100" />
      </div>
    </main>
  );
}
