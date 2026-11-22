import { getApecMaxDetails, getApecMaxPages } from "../config.js";
import { passesFilters } from "../filters.js";
import type { ApecCollectResult, ApecSearchJob, JobOffer } from "../types.js";
import { getApecJob, searchApec, type ApecSearchParams } from "./client.js";
import {
  buildRemoteNameMap,
  fromApecSearchJob,
  isExcludedContract,
  isRecentApecJob,
} from "./normalize.js";

export const DEFAULT_APEC_QUERIES: string[] = [
  "graphiste",
  "directeur artistique",
  "directrice artistique",
  "graphiste PAO",
];

export interface ApecCollectOptions {
  queries?: string[];
  searchFn?: typeof searchApec;
  jobFn?: typeof getApecJob;
  maxPages?: number;
  maxDetails?: number;
  /** Fenêtre de fraîcheur en heures (défaut 24). */
  recentHours?: number;
  /** Types de contrat API.SH (défaut hors stage/alternance). */
  contractType?: string;
}

/**
 * Collecte Apec via API.SH : search (crédits) + détail optionnel.
 */
export async function collectApecOffers(options: ApecCollectOptions = {}): Promise<ApecCollectResult> {
  const queries = options.queries ?? DEFAULT_APEC_QUERIES;
  const searchFn = options.searchFn ?? searchApec;
  const jobFn = options.jobFn ?? getApecJob;
  const maxPages = options.maxPages ?? getApecMaxPages();
  const maxDetails = options.maxDetails ?? getApecMaxDetails();
  const recentHours = options.recentHours ?? 24;
  const contractType = options.contractType ?? "cdi,cdd,interim";

  const failedSearches: string[] = [];
  const errors: string[] = [];
  const byId = new Map<string, ApecSearchJob>();
  let remoteNames = new Map<number, string>();
  let pagesFetched = 0;

  for (const q of queries) {
    let page: number | null = 1;
    let pagesForQuery = 0;
    while (page != null && pagesForQuery < maxPages) {
      try {
        const params: ApecSearchParams = {
          q,
          page,
          sort: "date",
          contract_type: contractType,
        };
        const res = await searchFn(params);
        pagesFetched += 1;
        pagesForQuery += 1;

        if (res.facets?.remote?.length) {
          remoteNames = buildRemoteNameMap(res.facets.remote);
        }

        for (const job of res.jobs ?? []) {
          if (!job?.id) continue;
          if (isExcludedContract(job.contract_type)) continue;
          if (!isRecentApecJob(job, recentHours)) continue;
          if (!byId.has(job.id)) byId.set(job.id, job);
        }

        page = res.next_page ?? null;
      } catch (err) {
        failedSearches.push(`${q}:p${page}`);
        errors.push(`${q}: ${err instanceof Error ? err.message : String(err)}`);
        break;
      }
    }
  }

  const candidates = [...byId.values()];
  let detailsFetched = 0;
  const offers: JobOffer[] = [];
  const seen = new Set<string>();

  for (const job of candidates) {
    let detail = null;
    if (detailsFetched < maxDetails) {
      try {
        detail = await jobFn(job.id!);
        detailsFetched += 1;
      } catch (err) {
        errors.push(`job:${job.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const offer = fromApecSearchJob(job, remoteNames, detail);
    if (!passesFilters(offer, { employmentType: job.contract_type ?? undefined })) continue;
    if (seen.has(offer.id)) continue;
    seen.add(offer.id);
    offers.push(offer);
  }

  return {
    offers,
    jobsSeen: byId.size,
    pagesFetched,
    detailsFetched,
    failedSearches,
    errors,
  };
}
