"use client";

import { useState, type FormEvent } from "react";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { CreateDataSourceInput } from "@/lib/api";
import type { Organization, SourceType } from "@/lib/types";

const INPUT_CLASSES =
  "w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 placeholder-navy-300 transition-shadow focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

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
      <p className="-mt-2 mb-4 text-sm text-navy-500">
        Register a data source for{" "}
        <span className="font-medium text-navy-800">{organization.name}</span>.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="source-name"
            className="mb-1 block text-sm font-medium text-navy-800"
          >
            Source Name <span aria-hidden="true" className="text-aqua-600">*</span>
          </label>
          <input
            id="source-name"
            type="text"
            required
            maxLength={255}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder='e.g. "Supplier A Inventory Sheet"'
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label
            htmlFor="source-type"
            className="mb-1 block text-sm font-medium text-navy-800"
          >
            Source Type <span aria-hidden="true" className="text-aqua-600">*</span>
          </label>
          <select
            id="source-type"
            required
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value as SourceType)}
            className={INPUT_CLASSES}
          >
            {SOURCE_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Spinner className="h-4 w-4" />}
            {submitting ? "Adding…" : "Add Data Source"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
