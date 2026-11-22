import { loadAgentOffers, mergeSourceStatuses } from "./agent-offers.js";
import { collectApecOffers } from "./apec/queries.js";
import { dedupeOffers } from "./dedupe.js";
import { passesFilters } from "./filters.js";
import { collectJobs } from "./jsearch/queries.js";
import { fromJSearchJob } from "./normalize.js";
import {
  buildApecSourceStatuses,
  buildIndeedJSearchStatuses,
  buildSkippedRapidApiStatuses,
  buildSourceStatuses,
} from "./sources.js";
import type { ApecCollectResult, CollectResult, JobOffer, JSearchJob, SourceStatus } from "./types.js";

const EMPTY_COLLECT: CollectResult = {
  rawJobs: [],
  failedQueries: [],
  retriedQueries: [],
  errors: [],
};

const EMPTY_APEC: ApecCollectResult = {
  offers: [],
  jobsSeen: 0,
  pagesFetched: 0,
  detailsFetched: 0,
  failedSearches: [],
  errors: [],
};

export function processRawJobs(rawJobs: JSearchJob[]): JobOffer[] {
  const mapped = rawJobs.map(fromJSearchJob);
  const filtered = mapped.filter((o, i) =>
    passesFilters(o, {
      employmentType: rawJobs[i]?.job_employment_type,
      country: rawJobs[i]?.job_country,
    }),
  );
  return dedupeOffers(filtered);
}

export function filterAgentOffers(offers: JobOffer[]): JobOffer[] {
  return offers.filter((o) => passesFilters(o));
}

export function recountSourcesForOffers(offers: JobOffer[], base: SourceStatus[]): SourceStatus[] {
  const counts = new Map(base.map((s) => [s.source, 0]));
  for (const o of offers) {
    for (const src of o.sources) {
      if (counts.has(src as never)) {
        counts.set(src as never, (counts.get(src as never) ?? 0) + 1);
      }
    }
  }
  return base.map((s) => {
    const count = counts.get(s.source) ?? 0;
    let remark = s.remark;
    if (count > 0) {
      if (
        remark.startsWith("non couverte") ||
        remark.startsWith("en attente") ||
        remark.includes("absent") ||
        remark.startsWith("aucune offre") ||
        remark.startsWith("illisible")
      ) {
        remark = "";
      }
    }
    return { ...s, count, remark };
  });
}

export async function collectAndFilter(
  options?: Parameters<typeof collectJobs>[0] & { skipRapidApi?: boolean },
): Promise<{
  collect: CollectResult;
  apec: ApecCollectResult;
  offers: JobOffer[];
  sources: SourceStatus[];
}> {
  const { skipRapidApi, ...collectOptions } = options ?? {};
  const agent = loadAgentOffers();
  const agentOffers = filterAgentOffers(agent.offers);

  if (skipRapidApi) {
    const skipped = buildSkippedRapidApiStatuses();
    const offers = dedupeOffers(agentOffers);
    const sources = recountSourcesForOffers(offers, mergeSourceStatuses([agent.sources, skipped]));
    return { collect: EMPTY_COLLECT, apec: EMPTY_APEC, offers, sources };
  }

  const collect = await collectJobs(collectOptions);
  const jsearchOffers = processRawJobs(collect.rawJobs);
  const indeedStatuses = buildIndeedJSearchStatuses(collect.rawJobs, collect.failedQueries);

  const apec = await collectApecOffers();
  const apecStatuses = buildApecSourceStatuses(apec);

  const offers = dedupeOffers([...agentOffers, ...jsearchOffers, ...apec.offers]);
  const mergedBase = mergeSourceStatuses([agent.sources, indeedStatuses, apecStatuses]);
  const sources = recountSourcesForOffers(offers, mergedBase);

  return { collect, apec, offers, sources };
}

/** Dry-run / tests : fixtures JSearch + offres-agent.json */
export function mergeFixtureAndAgent(rawJobs: JSearchJob[]): { offers: JobOffer[]; sources: SourceStatus[] } {
  const jsearchOffers = processRawJobs(rawJobs);
  const jStatuses = buildSourceStatuses(rawJobs, []);
  const agent = loadAgentOffers();
  const agentOffers = filterAgentOffers(agent.offers);
  const offers = dedupeOffers([...agentOffers, ...jsearchOffers]);
  const sources = recountSourcesForOffers(offers, mergeSourceStatuses([agent.sources, jStatuses]));
  return { offers, sources };
}
