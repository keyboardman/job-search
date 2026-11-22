import { normKey } from "./normalize.js";
import type { JobOffer } from "./types.js";

function dedupeKey(o: JobOffer): string {
  const loc = o.remote === "complet" ? "remote" : normKey(o.location);
  return `${normKey(o.company)}|${normKey(o.title)}|${loc}`;
}

/** Fusionne les offres multi-sources en une ligne. */
export function dedupeOffers(offers: JobOffer[]): JobOffer[] {
  const map = new Map<string, JobOffer>();
  for (const offer of offers) {
    const key = dedupeKey(offer);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...offer,
        sources: [...new Set(offer.sources)],
        urls: [...new Set(offer.urls)],
      });
      continue;
    }
    existing.sources = [...new Set([...existing.sources, ...offer.sources])];
    existing.urls = [...new Set([...existing.urls, ...offer.urls])];
    if (existing.summary === "non précisé" && offer.summary !== "non précisé") {
      existing.summary = offer.summary;
    }
    if (existing.date === "non précisé" && offer.date !== "non précisé") {
      existing.date = offer.date;
    }
  }
  return [...map.values()];
}
