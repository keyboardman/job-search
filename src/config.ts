import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..");

export function getRapidApiKey(): string | undefined {
  const key = process.env.RAPIDAPI_KEY?.trim();
  return key || undefined;
}

export function getNumPages(): number {
  const n = Number(process.env.JSEARCH_NUM_PAGES ?? "1");
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(20, Math.floor(n));
}

export function getTimeoutMs(): number {
  const n = Number(process.env.JSEARCH_TIMEOUT_MS ?? "20000");
  return Number.isFinite(n) && n > 0 ? n : 20_000;
}

/** Timeout HTTP APEC API by API.SH (défaut 60000). */
export function getApecTimeoutMs(): number {
  const n = Number(process.env.APEC_TIMEOUT_MS ?? "60000");
  return Number.isFinite(n) && n > 0 ? n : 60_000;
}

/** Pages Apec par query (1–5, défaut 1 → 20 offres max / query). */
export function getApecMaxPages(): number {
  const n = Number(process.env.APEC_MAX_PAGES ?? "1");
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(5, Math.floor(n));
}

/** Plafond d’appels détail Apec par run (0–50, défaut 0 = search seul). */
export function getApecMaxDetails(): number {
  const n = Number(process.env.APEC_MAX_DETAILS ?? "0");
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(50, Math.floor(n));
}

export const PATHS = {
  prompt: path.join(ROOT, "prompts", "veille-emploi-graphiste-da.md"),
  memory: path.join(ROOT, "data", "offres-veille.json"),
  outputDir: path.join(ROOT, "output"),
  fixturesDir: path.join(ROOT, "test", "fixtures"),
};

export const DRIVE_FOLDER_NAME = "Veille emploi graphiste-DA";
export const JSEARCH_HOST = "jsearch.p.rapidapi.com";
/** Endpoint actuel RapidAPI JSearch (ex-/search obsolète → 404). */
export const JSEARCH_SEARCH_URL = `https://${JSEARCH_HOST}/search-v2`;

/** RapidAPI — APEC API by API.SH (https://rapidapi.com/CaesarRodman/api/apec-api-by-api-sh). */
export const APEC_HOST = "apec-api-by-api-sh.p.rapidapi.com";
export const APEC_BASE_URL = `https://${APEC_HOST}`;
export const APEC_SEARCH_URL = `${APEC_BASE_URL}/apec/v1/search`;
export const APEC_JOB_URL = `${APEC_BASE_URL}/apec/v1/job`;
