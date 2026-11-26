import type { JobOffer, RemoteKind } from "./types.js";

const TITLE_OK =
  /\b(graphistes?|infographistes?|directeurs?(?:·rice)?\s+artistiques?|directrices?\s+artistiques?|\bda\b|directions?\s+artistiques?|arts?\s+directors?|graphic\s+designers?|designers?\s+graphiques?|pao|mises?\s+en\s+page)\b/i;

const EXCLUDE =
  /\b(stage|stagiaire|alternance|alternant|apprentissage|apprenti|contrat\s+de\s+professionnalisation|intern(?:ship)?)\b/i;

/** Conception de stands 3D : hors graphiste / direction artistique. */
const STAND_3D = /\bstands?\b/i;
const DESIGN_3D = /\b3\s?d\b/i;

const IDF =
  /\b(paris|île[- ]?de[- ]?france|ile[- ]?de[- ]?france|\bidf\b|hauts[- ]?de[- ]?seine|seine[- ]?saint[- ]?denis|val[- ]?de[- ]?marne|val[- ]?d['’]?oise|yvelines|essonne|seine[- ]?et[- ]?marne|92|93|94|95|78|91|77|75)\b/i;

const OISE_AISNE = /\b(oise|\b60\b|aisne|\b02\b|beauvais|compiègne|compiegne|soissons|laon|chantilly|senlis)\b/i;

const FRANCE = /\b(france|\bfr\b|île[- ]?de[- ]?france|paris)\b/i;

export function isRelevantTitle(title: string): boolean {
  return TITLE_OK.test(title) && !EXCLUDE.test(title);
}

export function isOffMetier(title: string, summary: string): boolean {
  if (!/\bdesigners?\s+graphiques?\b/i.test(title)) return false;
  const blob = `${title} ${summary}`;
  return STAND_3D.test(blob) && DESIGN_3D.test(blob);
}

export function isInternshipOrAlternance(text: string, employmentType?: string): boolean {
  if (employmentType && /\bintern(?:ship)?\b|apprentice|alternance|stage/i.test(employmentType)) {
    return true;
  }
  return EXCLUDE.test(text);
}

export function locationAllowed(location: string, remote: RemoteKind): boolean {
  if (remote === "complet") {
    // remote France : si pays hors FR explicite → rejeter
    if (/\b(united states|usa|uk|united kingdom|germany|deutschland|spain|italia|italy)\b/i.test(location)) {
      return false;
    }
    return true;
  }
  const loc = location || "";
  return IDF.test(loc) || OISE_AISNE.test(loc);
}

export function isFranceJob(location: string, country?: string): boolean {
  if (country && country.toLowerCase() === "fr") return true;
  if (!location.trim()) return true; // JSearch country=fr déjà
  if (FRANCE.test(location) || IDF.test(location) || OISE_AISNE.test(location)) return true;
  // villes FR courantes sans pays
  if (!/\b(united states|usa|uk|germany|spain)\b/i.test(location)) return true;
  return false;
}

export function passesFilters(
  offer: Pick<JobOffer, "title" | "summary" | "location" | "remote">,
  extras?: { employmentType?: string; country?: string },
): boolean {
  const blob = `${offer.title} ${offer.summary}`;
  if (!isRelevantTitle(offer.title)) return false;
  if (isOffMetier(offer.title, offer.summary)) return false;
  if (isInternshipOrAlternance(blob, extras?.employmentType)) return false;
  if (!isFranceJob(offer.location, extras?.country)) return false;
  if (!locationAllowed(offer.location, offer.remote)) return false;
  return true;
}
