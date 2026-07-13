"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTestCase } from "@/server/actions/test-cases";
import { createTestCaseSchema } from "@/lib/validators";

export function CreateTestCaseForm({
  promptId,
  variableNames,
}: {
  promptId: string;
  variableNames: string[];
}) {
  const [name, setName] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [expectedCriteria, setExpectedCriteria] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createTestCaseSchema.safeParse({
      promptId,
      name,
      variableValues: values,
      expectedCriteria,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    startTransition(async () => {
      const result = await createTestCase(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setName("");
      setValues({});
      setExpectedCriteria("");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-neutral-200 p-4"
    >
      <label className="block text-sm font-medium text-neutral-700">
        Case name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          placeholder="Angry customer, late order"
        />
      </label>

      {variableNames.length === 0 ? (
        <p className="text-sm text-neutral-400">
          This version has no {"{{variables}}"} — nothing to fill in.
        </p>
      ) : (
        variableNames.map((varName) => (
          <label
            key={varName}
            className="block text-sm font-medium text-neutral-700"
          >
            {varName}
            <input
              value={values[varName] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [varName]: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            />
          </label>
        ))
      )}

      <label className="block text-sm font-medium text-neutral-700">
        What does a good response look like?
        <textarea
          value={expectedCriteria}
          onChange={(e) => setExpectedCriteria(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          placeholder="Acknowledges the delay, offers a concrete next step, no generic apology filler"
        />
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || name.trim().length === 0}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Adding…" : "Add test case"}
      </button>
    </form>
  );
}
