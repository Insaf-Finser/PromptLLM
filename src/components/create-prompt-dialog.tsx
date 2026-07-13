"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPrompt } from "@/server/actions/prompts";
import { createPromptSchema } from "@/lib/validators";

export function CreatePromptDialog({ label = "New prompt" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    // Client-side check with the SAME schema the server uses — catches
    // obvious mistakes instantly, but the server re-validates regardless.
    const parsed = createPromptSchema.safeParse({ name, description });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    startTransition(async () => {
      const result = await createPrompt(parsed.data);
      if (!result.ok) {
        setFieldError(result.error);
        return;
      }
      setOpen(false);
      setName("");
      setDescription("");
      router.push(`/prompts/${result.data.id}`);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-neutral-900">New prompt</h2>

        <label className="mt-4 block text-sm font-medium text-neutral-700">
          Name
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            placeholder="Support reply drafter"
          />
        </label>

        <label className="mt-3 block text-sm font-medium text-neutral-700">
          Description <span className="font-normal text-neutral-400">(optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          />
        </label>

        {fieldError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {fieldError}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || name.trim().length === 0}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creating…" : "Create prompt"}
          </button>
        </div>
      </form>
    </div>
  );
}
