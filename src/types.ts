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
