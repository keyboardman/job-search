import { OBLIGATORY_SOURCES, type JSearchJob, type ObligatorySource, type SourceStatus } from "./types.js";

const PUBLISHER_PATTERNS: Array<{ source: ObligatorySource; patterns: RegExp[] }> = [
  {
    source: "Welcome to the Jungle",
    patterns: [/welcome\s*to\s*the\s*jungle/i, /\bwttj\b/i],
  },
  { source: "Indeed", patterns: [/indeed/i] },
  { source: "LinkedIn Emplois", patterns: [/linkedin/i] },
  {
    source: "France Travail",
    patterns: [/france\s*travail/i, /p[oô]le\s*emploi/i],
  },
  { source: "Hellowork", patterns: [/hellowork/i, /hello\s*work/i] },
  { source: "Apec", patterns: [/\bapec\b/i] },
  { source: "ProfilCulture", patterns: [/profil\s*culture/i] },
  { source: "JobCulture", patterns: [/job\s*culture/i] },
];

export function mapPublisherToSource(publisher?: string, url?: string): string {
  const hay = `${publisher ?? ""} ${url ?? ""}`;
  for (const { source, patterns } of PUBLISHER_PATTERNS) {
    if (patterns.some((re) => re.test(hay))) return source;
  }
  const cleaned = (publisher ?? "").trim();
  return cleaned || "non précisé";
}

/** Statuts pour un run JSearch centré Indeed (les autres sources viennent du modèle Cursor). */
export function buildIndeedJSearchStatuses(jobs: JSearchJob[], failedQueries: string[]): SourceStatus[] {
  let indeedCount = 0;
  for (const job of jobs) {
    const mapped = mapPublisherToSource(job.job_publisher, job.job_apply_link ?? job.job_google_link);
    if (mapped === "Indeed" || /indeed/i.test(job.job_publisher ?? "") || /indeed/i.test(job.job_apply_link ?? "")) {
      indeedCount += 1;
    } else if (!job.job_publisher) {
      // query « via Indeed » : compter quand même si publisher vide
      indeedCount += 1;
    }
  }

  const indeedFailed = failedQueries.some((q) => /indeed/i.test(q));
  const remark =
    indeedFailed && indeedCount === 0
      ? "illisible / échec requête JSearch"
      : indeedCount === 0
        ? "aucune offre Indeed via JSearch"
        : "";

  return OBLIGATORY_SOURCES.map((source) => {
    if (source === "Indeed") return { source, count: indeedCount, remark };
    return { source, count: 0, remark: "" };
  });
}

/** @deprecated alias tests / fixtures multi-sources */
export function buildSourceStatuses(
  jobs: JSearchJob[],
  failedQueries: string[],
  options?: { forceUnreadables?: ObligatorySource[] },
): SourceStatus[] {
  const counts = new Map<ObligatorySource, number>();
  for (const s of OBLIGATORY_SOURCES) counts.set(s, 0);

  for (const job of jobs) {
    const mapped = mapPublisherToSource(job.job_publisher, job.job_apply_link ?? job.job_google_link);
    if ((OBLIGATORY_SOURCES as readonly string[]).includes(mapped)) {
      const key = mapped as ObligatorySource;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const unreadables = new Set(options?.forceUnreadables ?? []);
  for (const q of failedQueries) {
    const via = /via\s+(.+)$/i.exec(q)?.[1]?.trim();
    if (!via) continue;
    const mapped = mapPublisherToSource(via);
    if ((OBLIGATORY_SOURCES as readonly string[]).includes(mapped)) {
      unreadables.add(mapped as ObligatorySource);
    }
  }

  return OBLIGATORY_SOURCES.map((source) => {
    const count = counts.get(source) ?? 0;
    let remark = "";
    if (unreadables.has(source) && count === 0) {
      remark = "illisible / échec requête JSearch";
    } else if (count === 0) {
      remark = "non couverte / aucune offre via JSearch";
    }
    return { source, count, remark };
  });
}
