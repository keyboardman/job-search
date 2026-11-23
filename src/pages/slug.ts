import { createHash } from "node:crypto";
import { normKey } from "../normalize.js";
import type { JobOffer } from "../types.js";

/** Slug stable pour le nom de fichier HTML d’une offre. */
export function offerSlug(offer: JobOffer): string {
  const loc = offer.remote === "complet" ? "remote" : normKey(offer.location);
  const key = `${normKey(offer.company)}|${normKey(offer.title)}|${loc}`;
  const hash = createHash("sha1").update(key).digest("hex").slice(0, 10);
  const base = `${normKey(offer.company)}-${normKey(offer.title)}`
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${base || "offre"}-${hash}`;
}
