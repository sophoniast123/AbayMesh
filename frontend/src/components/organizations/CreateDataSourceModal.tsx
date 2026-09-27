"use client";

import { useState, type FormEvent } from "react";

import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import type { CreateDataSourceInput } from "@/lib/api";
import type { Organization, SourceType } from "@/lib/types";

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: "csv", label: "CSV" },
  { value: "excel", label: "Excel" },
  { value: "rest", label: "REST" },
];

interface CreateDataSourceModalProps {
  organization: Organization;
  onClose: () => void;
  onCreate: (input: CreateDataSourceInput) => Promise<boolean>;
}

export function CreateDataSourceModal({
  organization,
  onClose,
  onCreate,
}: CreateDataSourceModalProps) {
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("csv");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const ok = await onCreate({
      organization_id: organization.id,
      name: name.trim(),
      source_type: sourceType,
    });
    setSubmitting(false);
    if (ok) {
      onClose();
    }
  }

  return (
    <Modal title="Add Data Source" onClose={onClose}>
      <p className="-mt-2 mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        Register a data source for{" "}
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {organization.name}
        </span>
        .
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="source-name"
            className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Source Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="source-name"
            type="text"
            required
            maxLength={255}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder='e.g. "Supplier A Inventory Sheet"'
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label
            htmlFor="source-type"
            className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Source Type <span aria-hidden="true">*</span>
          </label>
          <select
            id="source-type"
            required
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value as SourceType)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {SOURCE_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
            {submitting ? "Adding…" : "Add Data Source"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
