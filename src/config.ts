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
