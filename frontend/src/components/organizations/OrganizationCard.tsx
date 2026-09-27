"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
    <Card>
      <section aria-labelledby={`org-${organization.id}`}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-navy-50 p-5">
          <div>
            <h2
              id={`org-${organization.id}`}
              className="text-base font-semibold text-navy-900"
            >
              {organization.name}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-navy-400">
              /{organization.slug} &middot; created {formatDate(organization.created_at)}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onAddSource(organization)}>
            <span aria-hidden="true">+</span> Add Data Source
          </Button>
        </div>

        <div className="p-5">
          {sources.length === 0 ? (
            <p className="rounded-xl border border-dashed border-navy-200 px-4 py-6 text-center text-sm text-navy-400">
              No data sources connected yet. Add one to start ingesting supplier
              data.
            </p>
          ) : (
            <ul className="divide-y divide-navy-50">
              {sources.map((source) => (
                <li
                  key={source.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-800">
                      {source.name}
                    </p>
                    <p className="text-xs text-navy-400">
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
    </Card>
  );
}
