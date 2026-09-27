"use client";

import { useState, type FormEvent } from "react";

import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import type { CreateOrganizationInput } from "@/lib/api";

interface CreateOrganizationModalProps {
  onClose: () => void;
  onCreate: (input: CreateOrganizationInput) => Promise<boolean>;
}

export function CreateOrganizationModal({
  onClose,
  onCreate,
}: CreateOrganizationModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const ok = await onCreate({
      name: name.trim(),
      ...(slug.trim() ? { slug: slug.trim() } : {}),
    });
    setSubmitting(false);
    if (ok) {
      onClose();
    }
  }

  return (
    <Modal title="New Organization" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="org-name"
            className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Organization Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="org-name"
            type="text"
            required
            maxLength={255}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Gebeta Manufacturing"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label
            htmlFor="org-slug"
            className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Slug <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input
            id="org-slug"
            type="text"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            maxLength={255}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="auto-generated from name if left empty"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {submitting && <Spinner className="h-4 w-4" />}
            {submitting ? "Creating…" : "Create Organization"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
