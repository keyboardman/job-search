import fs from "node:fs";
import path from "node:path";
import type { JobOffer } from "../types.js";
import { offerSlug } from "./slug.js";

const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

/** Affiche une date ISO `AAAA-MM-JJ` en français (`22 novembre 2026`). */
export function formatDateFr(date: string): string {
  const raw = date.trim();
  if (!raw || raw === "non précisé") return raw || "non précisé";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!m) return raw;
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return raw;
  return `${day} ${MONTHS_FR[month - 1]} ${m[1]}`;
}

/** Échappe les caractères qui cassent un tableau Markdown. */
function mdCell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

export function renderIndexMarkdown(offers: Array<{ offer: JobOffer; slug: string }>): string {
  const header = `# Veille emploi graphiste / DA

${offers.length} offre${offers.length === 1 ? "" : "s"} · source Excel Drive

`;

  if (offers.length === 0) {
    return `${header}Aucune offre trouvée dans les Excel Drive.

---

Généré à partir des fichiers Excel du dossier Drive « Veille emploi graphiste-DA ».
`;
  }

  const rows = offers
    .map(
      ({ offer, slug }) =>
        `| ${mdCell(offer.company)} | ${mdCell(offer.title)} | ${mdCell(offer.location)} | ${mdCell(formatDateFr(offer.date))} | [Détail](./offres/${slug}.md) |`,
    )
    .join("\n");

  return `${header}| Société | Intitulé | Localisation | Date | |
| --- | --- | --- | --- | --- |
${rows}

---

Généré à partir des fichiers Excel du dossier Drive « Veille emploi graphiste-DA ».
`;
}

export function renderOfferMarkdown(offer: JobOffer, _slug: string): string {
  const url = offer.urls[0] ?? "";
  const lien = url || "non précisé";
  return `[← Retour au récapitulatif](../README.md)

# ${offer.title}

**${offer.company}**

| Champ | Valeur |
| --- | --- |
| Société | ${mdCell(offer.company)} |
| Intitulé | ${mdCell(offer.title)} |
| Descriptif | ${mdCell(offer.summary)} |
| Localisation | ${mdCell(offer.location)} |
| Télétravail | ${mdCell(offer.remote)} |
| Langues | ${mdCell(offer.languages)} |
| Date | ${mdCell(formatDateFr(offer.date))} |
| Sources | ${mdCell(offer.sources.join(", ") || "non précisé")} |
| Lien | ${lien === "non précisé" ? "non précisé" : `[${mdCell(lien)}](${lien})`} |
| Nouveau | ${offer.isNew ? "oui" : "non"} |
`;
}

export type GenerateResult = {
  indexPath: string;
  offerPaths: string[];
  slugs: string[];
};

function removeIfExists(p: string): void {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

/**
 * Écrit `site/README.md` et `site/offres/<slug>.md` (rendu natif GitHub).
 * Une régénération écrase le contenu précédent (dossier `offres/` vidé, anciens HTML retirés).
 */
export function writeSitePages(offers: JobOffer[], siteDir: string): GenerateResult {
  const offresDir = path.join(siteDir, "offres");
  fs.mkdirSync(siteDir, { recursive: true });

  removeIfExists(offresDir);
  removeIfExists(path.join(siteDir, "assets"));
  removeIfExists(path.join(siteDir, "index.html"));
  fs.mkdirSync(offresDir, { recursive: true });

  const withSlugs = offers.map((offer) => ({ offer, slug: offerSlug(offer) }));
  const indexPath = path.join(siteDir, "README.md");
  fs.writeFileSync(indexPath, renderIndexMarkdown(withSlugs), "utf8");

  const offerPaths: string[] = [];
  const slugs: string[] = [];
  for (const { offer, slug } of withSlugs) {
    const p = path.join(offresDir, `${slug}.md`);
    fs.writeFileSync(p, renderOfferMarkdown(offer, slug), "utf8");
    offerPaths.push(p);
    slugs.push(slug);
  }

  return { indexPath, offerPaths, slugs };
}
