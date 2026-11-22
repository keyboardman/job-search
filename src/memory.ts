import fs from "node:fs";
import path from "node:path";
import { PATHS } from "./config.js";
import type { JobOffer, MemoryFile } from "./types.js";

export function emptyMemory(): MemoryFile {
  return { schemaVersion: 1, updatedAt: null, offers: [] };
}

export function loadMemory(filePath = PATHS.memory): MemoryFile {
  if (!fs.existsSync(filePath)) return emptyMemory();
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as MemoryFile;
  if (!parsed || !Array.isArray(parsed.offers)) return emptyMemory();
  return parsed;
}

export function markNewOffers(offers: JobOffer[], previous: MemoryFile): JobOffer[] {
  const prevIds = new Set(previous.offers.map((o) => o.id));
  // aussi matcher urls pour robustesse
  const prevUrls = new Set(previous.offers.flatMap((o) => o.urls ?? []));
  return offers.map((o) => ({
    ...o,
    isNew: previous.offers.length === 0 ? true : !prevIds.has(o.id) && !o.urls.some((u) => prevUrls.has(u)),
  }));
}

export function saveMemory(offers: JobOffer[], filePath = PATHS.memory): void {
  const payload: MemoryFile = {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    offers: offers.map(({ id, company, title, location, date, urls }) => ({
      id,
      company,
      title,
      location,
      date,
      urls,
    })),
  };
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
