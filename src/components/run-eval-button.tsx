"use client";

import { useState, useTransition } from "react";
import { runEval } from "@/server/actions/eval-runs";
import type { EvalRunWithResults } from "@/types";
import { EvalResultsTable } from "./eval-results-table";

export function RunEvalButton({
  promptVersionId,
  hasTestCases,
}: {
  promptVersionId: string;
  hasTestCases: boolean;
}) {
  const [run, setRun] = useState<EvalRunWithResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRun() {
    setError(null);
    startTransition(async () => {
      const result = await runEval({ promptVersionId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRun(result.data);
    });
  }

  return (
    <div>
      <button
        onClick={handleRun}
        disabled={isPending || !hasTestCases}
        title={hasTestCases ? undefined : "Add at least one test case first"}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Running eval…" : "Run eval"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {run && (
        <div className="mt-6">
          <EvalResultsTable run={run} />
        </div>
      )}
    </div>
  );
}
