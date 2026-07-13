import { getVersion } from "@/server/actions/versions";
import { listTestCases } from "@/server/actions/test-cases";
import { CreateTestCaseForm } from "@/components/create-test-case-form";
import { RunEvalButton } from "@/components/run-eval-button";

export default async function VersionDetailPage({
  params,
}: {
  params: { id: string; vid: string };
}) {
  const [versionResult, testCasesResult] = await Promise.all([
    getVersion(params.vid),
    listTestCases(params.id),
  ]);

  if (!versionResult.ok) throw new Error(versionResult.error);
  if (!testCasesResult.ok) throw new Error(testCasesResult.error);

  const version = versionResult.data;
  const testCases = testCasesResult.data;

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <a
        href={`/prompts/${params.id}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← Back to prompt
      </a>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
        Version {version.versionNumber}
      </h1>
      <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
        {version.model}
      </span>

      <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-mono text-sm text-neutral-800">
        {version.templateText}
      </pre>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-medium text-neutral-500">
            Test cases ({testCases.length})
          </h2>

          <ul className="mt-3 space-y-2">
            {testCases.map((tc) => (
              <li
                key={tc.id}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              >
                <p className="font-medium text-neutral-900">{tc.name}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {tc.expectedCriteria}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <CreateTestCaseForm
              promptId={params.id}
              variableNames={version.variableNames}
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-neutral-500">Eval</h2>
          <div className="mt-3">
            <RunEvalButton
              promptVersionId={version.id}
              hasTestCases={testCases.length > 0}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
