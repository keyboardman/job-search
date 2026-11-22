import { loadAgentOffers, mergeSourceStatuses } from "./agent-offers.js";
import { dedupeOffers } from "./dedupe.js";
import { passesFilters } from "./filters.js";
import { collectJobs } from "./jsearch/queries.js";
import { fromJSearchJob } from "./normalize.js";
import { buildIndeedJSearchStatuses, buildSourceStatuses } from "./sources.js";
import type { CollectResult, JobOffer, JSearchJob, SourceStatus } from "./types.js";

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
        remark.startsWith("aucune offre")
      ) {
        remark = "";
      }
    }
    return { ...s, count, remark };
  });
}

export async function collectAndFilter(options?: Parameters<typeof collectJobs>[0]): Promise<{
  collect: CollectResult;
  offers: JobOffer[];
  sources: SourceStatus[];
}> {
  const collect = await collectJobs(options);
  const jsearchOffers = processRawJobs(collect.rawJobs);
  const indeedStatuses = buildIndeedJSearchStatuses(collect.rawJobs, collect.failedQueries);

  const agent = loadAgentOffers();
  const agentOffers = filterAgentOffers(agent.offers);

  const offers = dedupeOffers([...agentOffers, ...jsearchOffers]);
  const mergedBase = mergeSourceStatuses([agent.sources, indeedStatuses]);
  const sources = recountSourcesForOffers(offers, mergedBase);

  return { collect, offers, sources };
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
