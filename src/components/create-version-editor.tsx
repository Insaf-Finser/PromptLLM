"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVersion } from "@/server/actions/versions";
import {
  createVersionSchema,
  extractVariableNames,
  SUPPORTED_MODELS,
} from "@/lib/validators";

export function CreateVersionEditor({ promptId }: { promptId: string }) {
  const [templateText, setTemplateText] = useState("");
  const [model, setModel] = useState<(typeof SUPPORTED_MODELS)[number]>(
    SUPPORTED_MODELS[0] // llama-3.3-70b-versatile — strongest free model, sensible default
  );
  const [systemPrompt, setSystemPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Live-recomputed on every keystroke so the user sees exactly what
  // will be required as inputs before they save — same parser the
  // server re-runs on save, so there's no drift between preview and
  // what actually gets persisted.
  const variableNames = useMemo(
    () => extractVariableNames(templateText),
    [templateText]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createVersionSchema.safeParse({
      promptId,
      templateText,
      model,
      systemPrompt: systemPrompt || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    startTransition(async () => {
      const result = await createVersion(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/prompts/${promptId}/versions/${result.data.id}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-3 rounded-xl border border-neutral-200 p-4"
    >
      <label className="block text-sm font-medium text-neutral-700">
        Template
        <textarea
          value={templateText}
          onChange={(e) => setTemplateText(e.target.value)}
          rows={8}
          placeholder={"Hi {{customer_name}},\n\nRegarding {{issue}}..."}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        />
      </label>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Detected variables
        </p>
        {variableNames.length === 0 ? (
          <p className="mt-1 text-sm text-neutral-400">None yet</p>
        ) : (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {variableNames.map((name) => (
              <span
                key={name}
                className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-xs text-blue-700"
              >
                {"{{" + name + "}}"}
              </span>
            ))}
          </div>
        )}
      </div>

      <label className="block text-sm font-medium text-neutral-700">
        Model
        <select
          value={model}
          onChange={(e) =>
            setModel(e.target.value as (typeof SUPPORTED_MODELS)[number])
          }
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {SUPPORTED_MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-neutral-700">
        System prompt <span className="font-normal text-neutral-400">(optional)</span>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        />
      </label>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || templateText.trim().length === 0}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save version"}
      </button>
    </form>
  );
}
