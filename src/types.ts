export type RemoteKind = "complet" | "partiel" | "aucun" | "non précisé";

export const OBLIGATORY_SOURCES = [
  "Welcome to the Jungle",
  "Indeed",
  "LinkedIn Emplois",
  "France Travail",
  "Hellowork",
  "Apec",
  "ProfilCulture",
  "JobCulture",
] as const;

export type ObligatorySource = (typeof OBLIGATORY_SOURCES)[number];

export interface JobOffer {
  id: string;
  company: string;
  title: string;
  summary: string;
  location: string;
  remote: RemoteKind;
  languages: string;
  date: string; // ISO date or « non précisé »
  sources: string[];
  urls: string[];
  isNew?: boolean;
}

export interface SourceStatus {
  source: ObligatorySource;
  count: number;
  remark: string;
}

export interface MemoryFile {
  schemaVersion: number;
  updatedAt: string | null;
  offers: Array<Pick<JobOffer, "id" | "company" | "title" | "location" | "date" | "urls">>;
}

export interface JSearchJob {
  job_id?: string;
  employer_name?: string;
  job_title?: string;
  job_description?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_is_remote?: boolean;
  job_posted_at_datetime_utc?: string;
  job_posted_at_timestamp?: number;
  job_publisher?: string;
  job_apply_link?: string;
  job_google_link?: string;
  job_employment_type?: string;
  job_highlights?: {
    Qualifications?: string[];
  };
}

export interface CollectResult {
  rawJobs: JSearchJob[];
  failedQueries: string[];
  retriedQueries: string[];
  errors: string[];
}

/** Offre liste — GET /apec/v1/search (APEC API by API.SH sur RapidAPI). */
export interface ApecSearchJob {
  id?: string;
  title?: string;
  url?: string;
  company?: string;
  location?: string;
  salary?: string | null;
  contract_type?: string | null;
  snippet?: string | null;
  published_at?: string | null;
  remote_id?: number | null;
}

/** Détail — GET /apec/v1/job. */
export interface ApecJobAd {
  id?: string;
  title?: string;
  url?: string;
  company?: string;
  locations?: Array<{ id?: number; name?: string }>;
  description?: string | null;
  profile?: string | null;
  apply_url?: string | null;
  contract_type?: string | null;
  published_at?: string | null;
  modified_at?: string | null;
  remote_id?: number | null;
}

export interface ApecCollectResult {
  offers: JobOffer[];
  jobsSeen: number;
  pagesFetched: number;
  detailsFetched: number;
  failedSearches: string[];
  errors: string[];
}
