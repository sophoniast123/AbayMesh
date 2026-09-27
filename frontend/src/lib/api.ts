/**
 * Typed client for the Supply Chain Data Fabric API.
 *
 * The backend base URL comes from the environment
 * (see `.env.example` -> NEXT_PUBLIC_API_URL). All types mirror the backend
 * Pydantic contracts 1:1 — see `lib/types.ts`.
 */

import type { DataSource, Organization } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/** Error thrown when the API returns a non-2xx response. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Error thrown when the backend is unreachable (network failure). */
export class NetworkUnreachableError extends Error {
  constructor() {
    super(
      "Cannot reach the API server. Is the backend running on " +
        `${API_BASE_URL}?`
    );
    this.name = "NetworkUnreachableError";
  }
}

export type ApiResult<T> = { data: T } | { error: Error };

/** Low-level JSON request helper with unified error handling. */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new NetworkUnreachableError();
  }

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/** Pull a human-readable message out of a FastAPI error response. */
async function extractErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === "string") {
      return body.detail;
    }
    if (Array.isArray(body.detail)) {
      // FastAPI 422 validation error list
      const message = body.detail
        .map((issue: { msg?: string; loc?: (string | number)[] }) => {
          const field = (issue.loc ?? []).slice(1).join(".");
          return `${field}: ${issue.msg ?? "invalid value"}`;
        })
        .join("; ");
      return message ? `Validation failed: ${message}` : fallback;
    }
  } catch {
    // body was not JSON — keep the fallback
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------
export interface CreateOrganizationInput {
  name: string;
  slug?: string;
}

export async function getOrganizations(): Promise<Organization[]> {
  return request<Organization[]>("/organizations");
}

export async function createOrganization(
  data: CreateOrganizationInput
): Promise<Organization> {
  return request<Organization>("/organizations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Data Sources
// ---------------------------------------------------------------------------
export interface CreateDataSourceInput {
  organization_id: string;
  name: string;
  source_type: DataSource["source_type"];
  schema_fingerprint?: Record<string, unknown>;
}

export async function getDataSources(
  organizationId?: string
): Promise<DataSource[]> {
  const query = organizationId
    ? `?organization_id=${encodeURIComponent(organizationId)}`
    : "";
  return request<DataSource[]>(`/data-sources${query}`);
}

export async function createDataSource(
  data: CreateDataSourceInput
): Promise<DataSource> {
  return request<DataSource>("/data-sources", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
