import { getNumPages, getRapidApiKey, getTimeoutMs, JSEARCH_HOST, JSEARCH_SEARCH_URL } from "../config.js";
import type { JSearchJob } from "../types.js";

export interface SearchParams {
  query: string;
  country?: string;
  date_posted?: "all" | "today" | "3days" | "week" | "month";
  language?: string;
  num_pages?: number;
  work_from_home?: boolean;
}

export interface SearchResponse {
  status: string;
  /** Ancien format (tableau) ou search-v2 (`{ jobs, cursor }`). */
  data?: JSearchJob[] | { jobs?: JSearchJob[]; cursor?: string | null };
  error?: { message?: string; code?: string };
}

/** Extrait la liste d’offres quel que soit le format de `data`. */
export function extractJobs(data: SearchResponse["data"]): JSearchJob[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.jobs)) return data.jobs;
  return [];
}

export class JSearchError extends Error {
  constructor(
    message: string,
    readonly query: string,
    readonly causeName?: string,
  ) {
    super(message);
    this.name = "JSearchError";
  }
}

export async function searchJobs(params: SearchParams, fetchImpl: typeof fetch = fetch): Promise<JSearchJob[]> {
  const apiKey = getRapidApiKey();
  if (!apiKey) {
    throw new JSearchError("RAPIDAPI_KEY manquante", params.query);
  }

  const url = new URL(JSEARCH_SEARCH_URL);
  url.searchParams.set("query", params.query);
  url.searchParams.set("country", params.country ?? "fr");
  url.searchParams.set("date_posted", params.date_posted ?? "today");
  if (params.language) url.searchParams.set("language", params.language);
  url.searchParams.set("num_pages", String(params.num_pages ?? getNumPages()));
  if (params.work_from_home) url.searchParams.set("work_from_home", "true");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const res = await fetchImpl(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": JSEARCH_HOST,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new JSearchError(`HTTP ${res.status} ${body.slice(0, 200)}`, params.query);
    }

    const json = (await res.json()) as SearchResponse;
    if (json.status && json.status !== "OK") {
      throw new JSearchError(json.error?.message ?? `status=${json.status}`, params.query);
    }
    return extractJobs(json.data);
  } catch (err) {
    if (err instanceof JSearchError) throw err;
    const name = err instanceof Error ? err.name : "Error";
    const message = err instanceof Error ? err.message : String(err);
    throw new JSearchError(message, params.query, name);
  } finally {
    clearTimeout(timeout);
  }
}
