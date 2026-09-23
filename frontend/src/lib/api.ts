/**
 * Shared API client configuration.
 *
 * The backend base URL comes from the environment
 * (see `.env.example` -> NEXT_PUBLIC_API_URL).
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
