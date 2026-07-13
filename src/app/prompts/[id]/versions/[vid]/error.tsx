"use client";

export default function VersionDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-[680px] flex-col items-center gap-3 px-6 py-24 text-center">
      <p className="font-medium text-neutral-900">Couldn&apos;t load this version</p>
      <p className="text-sm text-neutral-500">{error.message}</p>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        Retry
      </button>
    </main>
  );
}
