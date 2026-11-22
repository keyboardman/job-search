import {
  OBLIGATORY_SOURCES,
  type ApecCollectResult,
  type JSearchJob,
  type ObligatorySource,
  type SourceStatus,
} from "./types.js";

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

/** Statuts Indeed / Apec quand RapidAPI n’est pas appelé (créneaux 13 h / 18 h). */
export function buildSkippedRapidApiStatuses(): SourceStatus[] {
  return OBLIGATORY_SOURCES.map((source) => {
    if (source === "Indeed" || source === "Apec") {
      return { source, count: 0, remark: "non interrogée (créneau hors matin)" };
    }
    return { source, count: 0, remark: "" };
  });
}

/** Statuts Apec issus d’APEC API by API.SH (RapidAPI). */
export function buildApecSourceStatuses(collect: ApecCollectResult): SourceStatus[] {
  const apecCount = collect.offers.filter((o) => o.sources.includes("Apec")).length;
  const failed = collect.failedSearches.length > 0 && apecCount === 0;
  let remark = "";
  if (failed) {
    remark = `illisible / ${collect.errors[0] ?? "échec APEC API"}`;
  } else if (apecCount === 0) {
    remark = "aucune offre via APEC API";
  }

  return OBLIGATORY_SOURCES.map((source) => {
    if (source === "Apec") return { source, count: apecCount, remark };
    return { source, count: 0, remark: "" };
  });
}

/** Statuts pour un run JSearch centré Indeed (les autres sources viennent du modèle Cursor). */
export function buildIndeedJSearchStatuses(jobs: JSearchJob[], failedQueries: string[]): SourceStatus[] {
  let indeedCount = 0;
  for (const job of jobs) {
    const mapped = mapPublisherToSource(job.job_publisher, job.job_apply_link ?? job.job_google_link);
    if (mapped === "Indeed" || /indeed/i.test(job.job_publisher ?? "") || /indeed/i.test(job.job_apply_link ?? "")) {
      indeedCount += 1;
    } else if (!job.job_publisher) {
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
