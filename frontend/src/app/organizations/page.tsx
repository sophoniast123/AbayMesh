"use client";

import { useCallback, useEffect, useState } from "react";

import { CreateDataSourceModal } from "@/components/organizations/CreateDataSourceModal";
import { CreateOrganizationModal } from "@/components/organizations/CreateOrganizationModal";
import { OrganizationCard } from "@/components/organizations/OrganizationCard";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import {
  createDataSource,
  createOrganization,
  getDataSources,
  getOrganizations,
} from "@/lib/api";
import type { DataSource, Organization } from "@/lib/types";

interface LoadState {
  organizations: Organization[];
  sourcesByOrg: Record<string, DataSource[]>;
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: LoadState = {
  organizations: [],
  sourcesByOrg: {},
  loading: true,
  error: null,
};

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export default function OrganizationsPage() {
  const [state, setState] = useState<LoadState>(INITIAL_STATE);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [sourceModalOrg, setSourceModalOrg] = useState<Organization | null>(null);

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [orgs, sources] = await Promise.all([
        getOrganizations(),
        getDataSources(),
      ]);
      const grouped: Record<string, DataSource[]> = {};
      for (const source of sources) {
        (grouped[source.organization_id] ??= []).push(source);
      }
      setState({
        organizations: orgs,
        sourcesByOrg: grouped,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: toMessage(error),
      }));
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /** Returns true when the organization was created successfully. */
  const handleCreateOrganization = useCallback(
    async (input: { name: string; slug?: string }): Promise<boolean> => {
      try {
        await createOrganization(input);
        await loadData();
        return true;
      } catch (error) {
        setState((prev) => ({ ...prev, error: toMessage(error) }));
        return false;
      }
    },
    [loadData]
  );

  /** Returns true when the data source was created successfully. */
  const handleCreateDataSource = useCallback(
    async (input: {
      organization_id: string;
      name: string;
      source_type: DataSource["source_type"];
    }): Promise<boolean> => {
      try {
        await createDataSource(input);
        await loadData();
        return true;
      } catch (error) {
        setState((prev) => ({ ...prev, error: toMessage(error) }));
        return false;
      }
    },
    [loadData]
  );

  const { organizations, sourcesByOrg, loading, error } = state;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Organizations &amp; Data Sources
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage supplier organizations and their connected data sources.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOrgModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span aria-hidden="true">+</span> New Organization
        </button>
      </header>

      {error && (
        <div className="mb-4">
          <Alert
            variant="error"
            message={error}
            onDismiss={() => setState((prev) => ({ ...prev, error: null }))}
          />
        </div>
      )}

      {loading ? (
        <div
          role="status"
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white py-24 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <Spinner className="h-6 w-6" />
          <p className="text-sm">Loading organizations…</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-24 text-center dark:border-zinc-700 dark:bg-zinc-950">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            No organizations yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            Create your first organization to start connecting supplier data
            sources.
          </p>
          <button
            type="button"
            onClick={() => setOrgModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <span aria-hidden="true">+</span> New Organization
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {organizations.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              sources={sourcesByOrg[organization.id] ?? []}
              onAddSource={setSourceModalOrg}
            />
          ))}
        </div>
      )}

      {orgModalOpen && (
        <CreateOrganizationModal
          onClose={() => setOrgModalOpen(false)}
          onCreate={handleCreateOrganization}
        />
      )}

      {sourceModalOrg && (
        <CreateDataSourceModal
          organization={sourceModalOrg}
          onClose={() => setSourceModalOrg(null)}
          onCreate={handleCreateDataSource}
        />
      )}
    </div>
  );
}
