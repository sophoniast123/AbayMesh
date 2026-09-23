"use client";

import { SourceTypeBadge } from "./SourceTypeBadge";
import type { DataSource, Organization } from "@/lib/types";

interface OrganizationCardProps {
  organization: Organization;
  sources: DataSource[];
  onAddSource: (organization: Organization) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function OrganizationCard({
  organization,
  sources,
  onAddSource,
}: OrganizationCardProps) {
  return (
    <section
      aria-labelledby={`org-${organization.id}`}
      className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 p-5 dark:border-zinc-800/60">
        <div>
          <h2
            id={`org-${organization.id}`}
            className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {organization.name}
          </h2>
          <p className="mt-0.5 font-mono text-xs text-zinc-500 dark:text-zinc-500">
            /{organization.slug} &middot; created {formatDate(organization.created_at)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAddSource(organization)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <span aria-hidden="true">+</span> Add Data Source
        </button>
      </div>

      <div className="p-5">
        {sources.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-500">
            No data sources connected yet. Add one to start ingesting supplier
            data.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {sources.map((source) => (
              <li
                key={source.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {source.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Added {formatDate(source.created_at)}
                  </p>
                </div>
                <SourceTypeBadge type={source.source_type} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
