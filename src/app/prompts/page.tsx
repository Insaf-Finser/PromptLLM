import Link from "next/link";
import { listPrompts } from "@/server/actions/prompts";
import { CreatePromptDialog } from "@/components/create-prompt-dialog";

export default async function PromptsPage() {
  const result = await listPrompts();

  if (!result.ok) {
    // Thrown here so the nearest error.tsx boundary catches it with a
    // retry button, instead of rendering a half-broken page.
    throw new Error(result.error);
  }

  const prompts = result.data;

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Prompts</h1>
        <CreatePromptDialog />
      </div>

      {prompts.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-8 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {prompts.map((prompt) => (
            <li key={prompt.id}>
              <Link
                href={`/prompts/${prompt.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <div>
                  <p className="font-medium text-neutral-900">{prompt.name}</p>
                  {prompt.description && (
                    <p className="mt-0.5 text-sm text-neutral-500">
                      {prompt.description}
                    </p>
                  )}
                </div>
                <span className="text-sm text-neutral-400">
                  Updated {new Date(prompt.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-300 py-16 text-center">
      <p className="font-medium text-neutral-900">No prompts yet</p>
      <p className="max-w-sm text-sm text-neutral-500">
        Create your first prompt to start versioning and testing it against
        real inputs.
      </p>
      <CreatePromptDialog label="Create your first prompt" />
    </div>
  );
}
