import type { JobOffer, SourceStatus } from "./types.js";

function scoreNew(o: JobOffer): number {
  let s = 0;
  if (/directeur|directrice|direction\s+artistique|\bda\b/i.test(o.title)) s += 3;
  if (o.remote === "complet") s += 2;
  if (o.remote === "partiel") s += 1;
  if (/senior/i.test(o.title)) s += 1;
  return s;
}

export function buildSummary(
  offers: JobOffer[],
  sources: SourceStatus[],
  driveLink?: string | null,
): string {
  const lines: string[] = [];
  if (offers.length === 0) {
    lines.push("Aucune offre retenue aujourd’hui.");
    lines.push("Sources consultées :");
    for (const s of sources) {
      const extra = s.remark ? ` — ${s.remark}` : "";
      lines.push(`- ${s.source} : ${s.count}${extra}`);
    }
    if (driveLink) lines.push(`Fichier Drive : ${driveLink}`);
    return lines.join("\n");
  }

  lines.push(`${offers.length} offre${offers.length > 1 ? "s" : ""} retenue${offers.length > 1 ? "s" : ""}.`);
  const news = offers.filter((o) => o.isNew).sort((a, b) => scoreNew(b) - scoreNew(a));
  const top = news.slice(0, 3);
  if (top.length === 0) {
    lines.push("Pas de nouveauté par rapport à hier.");
  } else {
    lines.push("Nouveautés les plus intéressantes :");
    for (const o of top) {
      lines.push(`- ${o.title} chez ${o.company} (${o.location}, télétravail ${o.remote})`);
    }
  }
  if (driveLink) {
    lines.push(`Fichier Drive : ${driveLink}`);
  } else {
    lines.push("Lien Drive : non précisé (dépôt à faire via MCP Google Drive).");
  }
  return lines.join("\n");
}
