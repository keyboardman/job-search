import { createHash } from "node:crypto";
import { mapPublisherToSource } from "./sources.js";
import type { JobOffer, JSearchJob, RemoteKind } from "./types.js";

const NON_PRECISE = "non précisé";

function firstSentences(text: string, max = 2): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return NON_PRECISE;
  const parts = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts.slice(0, max).join(" ") || cleaned.slice(0, 280);
}

export function detectRemote(job: JSearchJob): RemoteKind {
  if (job.job_is_remote === true) return "complet";
  const blob = `${job.job_title ?? ""} ${job.job_description ?? ""}`.toLowerCase();
  if (/télétravail\s+complet|full[\s-]?remote|100\s*%\s*remote|remote\s+only/.test(blob)) return "complet";
  if (/hybride|télétravail\s+partiel|partial\s+remote|2\s*j/.test(blob)) return "partiel";
  if (/sur\s+site|présentiel|on[\s-]?site|bureau uniquement/.test(blob)) return "aucun";
  if (job.job_is_remote === false) return "aucun";
  return NON_PRECISE;
}

export function detectLanguages(job: JSearchJob): string {
  const blob = `${job.job_description ?? ""}\n${(job.job_highlights?.Qualifications ?? []).join("\n")}`;
  const found: string[] = [];
  if (/anglais|english/i.test(blob)) found.push("anglais");
  if (/français|french/i.test(blob)) found.push("français");
  if (/espagnol|spanish/i.test(blob)) found.push("espagnol");
  if (/allemand|german/i.test(blob)) found.push("allemand");
  return found.length ? found.join(", ") : NON_PRECISE;
}

export function formatDate(job: JSearchJob): string {
  if (job.job_posted_at_datetime_utc) {
    return job.job_posted_at_datetime_utc.slice(0, 10);
  }
  if (job.job_posted_at_timestamp) {
    return new Date(job.job_posted_at_timestamp * 1000).toISOString().slice(0, 10);
  }
  return NON_PRECISE;
}

export function buildLocation(job: JSearchJob): string {
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  return parts.length ? parts.join(", ") : NON_PRECISE;
}

export function offerId(company: string, title: string, location: string): string {
  const raw = `${normKey(company)}|${normKey(title)}|${normKey(location)}`;
  return createHash("sha1").update(raw).digest("hex").slice(0, 16);
}

export function normKey(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function fromJSearchJob(job: JSearchJob): JobOffer {
  const company = job.employer_name?.trim() || NON_PRECISE;
  const title = job.job_title?.trim() || NON_PRECISE;
  const location = buildLocation(job);
  const source = mapPublisherToSource(job.job_publisher, job.job_apply_link ?? job.job_google_link);
  const url = job.job_apply_link || job.job_google_link || "";
  return {
    id: offerId(company, title, location === NON_PRECISE && job.job_is_remote ? "remote" : location),
    company,
    title,
    summary: firstSentences(job.job_description ?? ""),
    location,
    remote: detectRemote(job),
    languages: detectLanguages(job),
    date: formatDate(job),
    sources: [source],
    urls: url ? [url] : [],
  };
}
