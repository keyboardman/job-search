import {
  APEC_HOST,
  APEC_JOB_URL,
  APEC_SEARCH_URL,
  getApecTimeoutMs,
  getRapidApiKey,
} from "../config.js";
import type { ApecJobAd } from "../types.js";

export interface ApecSearchParams {
  q: string;
  page?: number;
  sort?: "relevance" | "date";
  /** Ex. cdi,cdd,interim — exclut stage/alternance côté API. */
  contract_type?: string;
  location?: string;
  remote?: string;
  fresh?: boolean;
}

export interface ApecFacetItem {
  id: number;
  count?: number;
  name?: string;
}

export interface ApecSearchResponse {
  success?: boolean;
  error?: string;
  q?: string;
  total?: number;
  page?: number;
  count?: number;
  next_page?: number | null;
  jobs?: import("../types.js").ApecSearchJob[];
  facets?: {
    remote?: ApecFacetItem[];
    contract_type?: ApecFacetItem[];
    published?: ApecFacetItem[];
    [key: string]: ApecFacetItem[] | undefined;
  };
  credits_used?: number;
  message?: string;
}

export interface ApecJobResponse extends ApecJobAd {
  success?: boolean;
  error?: string;
  credits_used?: number;
  message?: string;
}

export class ApecError extends Error {
  constructor(
    message: string,
    readonly context: string,
    readonly causeName?: string,
  ) {
    super(message);
    this.name = "ApecError";
  }
}

async function getJson<T>(
  url: URL,
  context: string,
  fetchImpl: typeof fetch,
): Promise<T> {
  const apiKey = getRapidApiKey();
  if (!apiKey) throw new ApecError("RAPIDAPI_KEY manquante", context);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getApecTimeoutMs());

  try {
    const res = await fetchImpl(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": APEC_HOST,
      },
      signal: controller.signal,
    });

    const text = await res.text();
    let json: T & { success?: boolean; error?: string; message?: string };
    try {
      json = JSON.parse(text) as T & { success?: boolean; error?: string; message?: string };
    } catch {
      throw new ApecError(`HTTP ${res.status} ${text.slice(0, 200)}`, context);
    }

    if (!res.ok || json.success === false) {
      throw new ApecError(
        json.error ?? json.message ?? `HTTP ${res.status} ${text.slice(0, 200)}`,
        context,
      );
    }

    return json;
  } catch (err) {
    if (err instanceof ApecError) throw err;
    const name = err instanceof Error ? err.name : "Error";
    const message = err instanceof Error ? err.message : String(err);
    throw new ApecError(message, context, name);
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchApec(
  params: ApecSearchParams,
  fetchImpl: typeof fetch = fetch,
): Promise<ApecSearchResponse> {
  const url = new URL(APEC_SEARCH_URL);
  url.searchParams.set("q", params.q);
  url.searchParams.set("sort", params.sort ?? "date");
  if (params.page != null) url.searchParams.set("page", String(params.page));
  if (params.contract_type) url.searchParams.set("contract_type", params.contract_type);
  if (params.location) url.searchParams.set("location", params.location);
  if (params.remote) url.searchParams.set("remote", params.remote);
  if (params.fresh) url.searchParams.set("fresh", "true");

  return getJson<ApecSearchResponse>(url, `search:${params.q}`, fetchImpl);
}

export async function getApecJob(
  id: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ApecJobAd> {
  const url = new URL(APEC_JOB_URL);
  url.searchParams.set("id", id);
  return getJson<ApecJobResponse>(url, `job:${id}`, fetchImpl);
}
