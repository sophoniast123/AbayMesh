"use client";

import { useState, type FormEvent } from "react";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { CreateOrganizationInput } from "@/lib/api";

const INPUT_CLASSES =
  "w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 placeholder-navy-300 transition-shadow focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

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
            className="mb-1 block text-sm font-medium text-navy-800"
          >
            Organization Name <span aria-hidden="true" className="text-aqua-600">*</span>
          </label>
          <input
            id="org-name"
            type="text"
            required
            maxLength={255}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Gebeta Manufacturing"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label
            htmlFor="org-slug"
            className="mb-1 block text-sm font-medium text-navy-800"
          >
            Slug <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id="org-slug"
            type="text"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            maxLength={255}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="auto-generated from name if left empty"
            className={`${INPUT_CLASSES} font-mono`}
          />
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Spinner className="h-4 w-4" />}
            {submitting ? "Creating…" : "Create Organization"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
