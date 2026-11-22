import { searchJobs, JSearchError } from "./client.js";
import type { CollectResult, JSearchJob } from "../types.js";

/**
 * JSearch ne couvre que Indeed (sites anti-bots).
 * Les autres sources sont parcourues par le modèle Cursor (voir prompt).
 */
export const DEFAULT_QUERIES: string[] = [
  "graphiste via Indeed",
  "directeur artistique via Indeed",
  "directrice artistique via Indeed",
  "graphiste PAO via Indeed",
  "graphiste télétravail via Indeed",
  "directeur artistique télétravail via Indeed",
];

export interface CollectOptions {
  queries?: string[];
  searchFn?: typeof searchJobs;
  /** Pour tests : forcer l'échec de certaines queries au premier passage. */
  failFirst?: Set<string>;
}

/**
 * Collecte avec stratégie timeout → suite → retry fin.
 */
export async function collectJobs(options: CollectOptions = {}): Promise<CollectResult> {
  const queries = options.queries ?? DEFAULT_QUERIES;
  const searchFn = options.searchFn ?? searchJobs;
  const failedQueries: string[] = [];
  const retriedQueries: string[] = [];
  const errors: string[] = [];
  const byId = new Map<string, JSearchJob>();
  let failFirst = options.failFirst ? new Set(options.failFirst) : undefined;

  async function runOne(query: string, isRetry: boolean): Promise<void> {
    if (failFirst?.has(query)) {
      failFirst.delete(query);
      throw new JSearchError("échec simulé", query, "Simulated");
    }
    const jobs = await searchFn({
      query,
      country: "fr",
      date_posted: "today",
      language: "fr",
    });
    for (const job of jobs) {
      const key = job.job_id ?? `${job.employer_name}|${job.job_title}|${job.job_apply_link}`;
      if (!byId.has(key)) byId.set(key, job);
    }
    if (isRetry) retriedQueries.push(query);
  }

  for (const query of queries) {
    try {
      await runOne(query, false);
    } catch (err) {
      failedQueries.push(query);
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  const toRetry = [...failedQueries];
  failedQueries.length = 0;

  for (const query of toRetry) {
    try {
      await runOne(query, true);
    } catch (err) {
      failedQueries.push(query);
      errors.push(`retry: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    rawJobs: [...byId.values()],
    failedQueries,
    retriedQueries,
    errors,
  };
}
