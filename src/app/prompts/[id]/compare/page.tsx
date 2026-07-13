import { listVersions } from "@/server/actions/versions";
import {
  compareVersions,
  getVersionSummary,
} from "@/server/actions/comparison";
import type { PromptVersionSummary } from "@/types";

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { left?: string; right?: string };
}) {
  const versionsResult = await listVersions(params.id);
  if (!versionsResult.ok) throw new Error(versionsResult.error);
  const versions = versionsResult.data;

  const { left, right } = searchParams;

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-8">
      <a
        href={`/prompts/${params.id}`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← Back to prompt
      </a>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
        Compare versions
      </h1>

      {/* Plain GET form — no client JS needed to pick two versions */}
      <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
        <VersionSelect name="left" versions={versions} selected={left} />
        <VersionSelect name="right" versions={versions} selected={right} />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Compare
        </button>
      </form>

      {left && right && (
        <ComparisonResult
          promptId={params.id}
          leftVersionId={left}
          rightVersionId={right}
        />
      )}
    </main>
  );
}

function VersionSelect({
  name,
  versions,
  selected,
}: {
  name: string;
  versions: { id: string; versionNumber: number }[];
  selected?: string;
}) {
  return (
    <label className="text-sm font-medium text-neutral-700">
      {name === "left" ? "Version A" : "Version B"}
      <select
        name={name}
        defaultValue={selected}
        className="mt-1 block rounded-md border border-neutral-300 px-3 py-2 text-sm"
      >
        <option value="" disabled>
          Select a version
        </option>
        {versions.map((v) => (
          <option key={v.id} value={v.id}>
            v{v.versionNumber}
          </option>
        ))}
      </select>
    </label>
  );
}

async function ComparisonResult({
  promptId,
  leftVersionId,
  rightVersionId,
}: {
  promptId: string;
  leftVersionId: string;
  rightVersionId: string;
}) {
  if (leftVersionId === rightVersionId) {
    return (
      <p className="mt-8 text-sm text-neutral-500">
        Pick two different versions to compare.
      </p>
    );
  }

  const check = await compareVersions(leftVersionId, rightVersionId);
  if (!check.ok) {
    return (
      <p className="mt-8 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {check.error}
      </p>
    );
  }

  const [leftResult, rightResult] = await Promise.all([
    getVersionSummary(leftVersionId),
    getVersionSummary(rightVersionId),
  ]);

  if (!leftResult.ok || !rightResult.ok) {
    return (
      <p className="mt-8 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {!leftResult.ok ? leftResult.error : (rightResult as { ok: false }).error}
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <VersionColumn summary={leftResult.data} promptId={promptId} />
      <VersionColumn summary={rightResult.data} promptId={promptId} />
    </div>
  );
}

function VersionColumn({
  summary,
  promptId,
}: {
  summary: PromptVersionSummary;
  promptId: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <a
          href={`/prompts/${promptId}/versions/${summary.id}`}
          className="font-medium text-neutral-900 hover:underline"
        >
          v{summary.versionNumber}
        </a>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
          {summary.model}
        </span>
      </div>

      <p className="mt-3 text-2xl font-semibold text-neutral-900">
        {summary.passRate === null
          ? "Not graded"
          : `${Math.round(summary.passRate * 100)}%`}
      </p>
      <p className="text-xs text-neutral-400">pass rate on latest run</p>

      <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-neutral-50 p-3 font-mono text-xs text-neutral-700">
        {summary.templateText}
      </pre>
    </div>
  );
}
