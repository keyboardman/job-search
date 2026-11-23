import fs from "node:fs";
import path from "node:path";
import { dedupeOffers } from "../dedupe.js";
import type { JobOffer } from "../types.js";
import { readOffersFromWorkbook } from "./read-workbook.js";

function sortByDateDesc(offers: JobOffer[]): JobOffer[] {
  return [...offers].sort((a, b) => {
    if (a.date === "non précisé" && b.date === "non précisé") return 0;
    if (a.date === "non précisé") return 1;
    if (b.date === "non précisé") return -1;
    return b.date.localeCompare(a.date);
  });
}

/** Liste uniquement les fichiers `.xlsx` d’un dossier (ignore JSON, CSV, etc.). */
export function listXlsxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith(".xlsx") && !name.startsWith("~$"))
    .map((name) => path.join(dir, name))
    .sort();
}

/**
 * Agrège les offres de tous les `.xlsx` du dossier d’entrée.
 * Ne lit jamais les JSON voisins (`offres-agent.json`, etc.).
 */
export async function loadOffersFromXlsxDir(dir: string): Promise<{
  offers: JobOffer[];
  filesRead: string[];
}> {
  const files = listXlsxFiles(dir);
  const all: JobOffer[] = [];
  for (const file of files) {
    all.push(...(await readOffersFromWorkbook(file)));
  }
  return {
    offers: sortByDateDesc(dedupeOffers(all)),
    filesRead: files,
  };
}
