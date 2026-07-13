"use client";

import { useState, useTransition } from "react";
import { gradeResult } from "@/server/actions/eval-runs";
import type { EvalRunWithResults } from "@/types";

export function EvalResultsTable({ run }: { run: EvalRunWithResults }) {
  const graded = run.results.filter((r) => r.pass !== null);
  const passed = graded.filter((r) => r.pass === true);
  const passRateLabel =
    graded.length === 0
      ? "Not graded yet"
      : `${passed.length}/${graded.length} passed`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-500">Results</h3>
        <span className="text-sm font-medium text-neutral-900">
          {passRateLabel}
        </span>
      </div>

      <ul className="mt-3 space-y-3">
        {run.results.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </ul>
    </div>
  );
}

function ResultCard({
  result,
}: {
  result: EvalRunWithResults["results"][number];
}) {
  const [isPending, startTransition] = useTransition();
  const [localPass, setLocalPass] = useState(result.pass);

  function grade(pass: boolean) {
    setLocalPass(pass); // optimistic — this is a low-risk, reversible toggle
    startTransition(async () => {
      const res = await gradeResult({ evalResultId: result.id, pass });
      if (!res.ok) {
        setLocalPass(result.pass); // roll back on failure
      }
    });
  }

  return (
    <li className="rounded-xl border border-neutral-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-neutral-900">{result.testCase.name}</p>
          <p className="mt-0.5 text-xs text-neutral-400">
            Expected: {result.testCase.expectedCriteria}
          </p>
        </div>
        {result.latencyMs != null && (
          <span className="shrink-0 text-xs text-neutral-400">
            {result.latencyMs}ms
          </span>
        )}
      </div>

      {result.error ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {result.error}
        </p>
      ) : (
        <p className="mt-3 whitespace-pre-wrap rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-800">
          {result.outputText}
        </p>
      )}

      {!result.error && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => grade(true)}
            disabled={isPending}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              localPass === true
                ? "bg-green-100 text-green-800"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Pass
          </button>
          <button
            onClick={() => grade(false)}
            disabled={isPending}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              localPass === false
                ? "bg-red-100 text-red-800"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Fail
          </button>
        </div>
      )}
    </li>
  );
}
