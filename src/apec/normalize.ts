import { detectLanguages, firstSentences, offerId } from "../normalize.js";
import type { ApecJobAd, ApecSearchJob, JobOffer, RemoteKind } from "../types.js";
import type { ApecFacetItem } from "./client.js";

const NON_PRECISE = "non précisé";

export function buildRemoteNameMap(facets?: ApecFacetItem[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const f of facets ?? []) {
    if (f?.id != null && f.name) map.set(f.id, f.name);
  }
  return map;
}

export function detectRemoteFromApec(
  job: Pick<ApecSearchJob, "remote_id" | "snippet" | "title">,
  remoteNames: Map<number, string>,
  detail?: ApecJobAd | null,
): RemoteKind {
  const facetName = job.remote_id != null ? remoteNames.get(job.remote_id) ?? "" : "";
  const blob = `${facetName} ${job.title ?? ""} ${job.snippet ?? ""} ${detail?.description ?? ""} ${detail?.profile ?? ""}`.toLowerCase();

  if (/télétravail\s+complet|full[\s-]?remote|100\s*%|total/.test(blob)) return "complet";
  if (/télétravail\s+partiel|hybride|partial|occasionnel|2\s*j/.test(blob)) return "partiel";
  if (/télétravail|remote|distanciel/.test(blob)) return "partiel";
  if (job.remote_id != null) return "partiel";
  if (/présentiel|sur\s+site|on[\s-]?site/.test(blob)) return "aucun";
  return NON_PRECISE;
}

export function isExcludedContract(contractType?: string | null): boolean {
  const t = (contractType ?? "").toLowerCase();
  return /stage|alternance|apprentissage|professionnalisation/.test(t);
}

/** Offre publiée / mise à jour dans les dernières `hours` heures. */
export function isRecentApecJob(
  job: Pick<ApecSearchJob, "published_at"> & { modified_at?: string | null },
  hours = 24,
  now = Date.now(),
): boolean {
  const raw = job.modified_at || job.published_at;
  if (!raw) return false;
  const ts = Date.parse(raw);
  if (!Number.isFinite(ts)) return false;
  return now - ts <= hours * 3600_000;
}

export function fromApecSearchJob(
  job: ApecSearchJob,
  remoteNames: Map<number, string>,
  detail?: ApecJobAd | null,
): JobOffer {
  const company = (detail?.company || job.company || "").trim() || NON_PRECISE;
  const title = (detail?.title || job.title || "").trim() || NON_PRECISE;
  const location =
    (detail?.locations?.[0]?.name || job.location || "").trim() || NON_PRECISE;
  const remote = detectRemoteFromApec(job, remoteNames, detail);
  const description =
    detail?.description ||
    [detail?.profile, job.snippet].filter(Boolean).join("\n") ||
    job.snippet ||
    "";
  const url = detail?.apply_url || detail?.url || job.url || "";
  const dateRaw = detail?.modified_at || detail?.published_at || job.published_at;
  const date = dateRaw ? dateRaw.slice(0, 10) : NON_PRECISE;

  return {
    id: offerId(company, title, remote === "complet" ? "remote" : location),
    company,
    title,
    summary: firstSentences(description),
    location,
    remote,
    languages: detectLanguages({ job_description: description }),
    date,
    sources: ["Apec"],
    urls: url ? [url] : [],
  };
}
