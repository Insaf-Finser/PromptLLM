import Link from "next/link";
import { getPrompt } from "@/server/actions/prompts";
import { listVersions } from "@/server/actions/versions";
import { CreateVersionEditor } from "@/components/create-version-editor";

export default async function PromptDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [promptResult, versionsResult] = await Promise.all([
    getPrompt(params.id),
    listVersions(params.id),
  ]);

  if (!promptResult.ok) {
    throw new Error(promptResult.error);
  }
  if (!versionsResult.ok) {
    throw new Error(versionsResult.error);
  }

  const prompt = promptResult.data;
  const versions = versionsResult.data;

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <Link href="/prompts" className="text-sm text-neutral-500 hover:underline">
        ← All prompts
      </Link>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
        {prompt.name}
      </h1>
      <div className="mt-2 flex items-center gap-3">
        {prompt.description && (
          <p className="text-neutral-500">{prompt.description}</p>
        )}
        <a
          href={`/prompts/${prompt.id}/compare`}
          className="ml-auto text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          Compare versions →
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,380px]">
        <section>
          <h2 className="text-sm font-medium text-neutral-500">
            Version history
          </h2>

          {versions.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-neutral-300 py-10 text-center">
              <p className="text-sm text-neutral-500">
                No versions yet — write your first template to the right.
              </p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
              {versions.map((version) => (
                <li key={version.id}>
                  <Link
                    href={`/prompts/${prompt.id}/versions/${version.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">
                        v{version.versionNumber}
                      </p>
                      <p className="mt-0.5 max-w-md truncate text-sm text-neutral-500">
                        {version.templateText}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-400">
                      <span>{version.variableNames.length} variables</span>
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                        {version.model}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside>
          <h2 className="text-sm font-medium text-neutral-500">New version</h2>
          <CreateVersionEditor promptId={prompt.id} />
        </aside>
      </div>
    </main>
  );
}
