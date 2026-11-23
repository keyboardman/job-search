import { parisDateString, parisScheduleSlot } from "./schedule.js";
import type { JobOffer } from "./types.js";

/**
 * Destinataires du mail de veille (envoi via MCP Gmail par l’agent Cursor).
 * Commenter une adresse pour l’exclure.
 */
export const EMAIL_TO = [
  "stella.moisan@gmail.com",
  "luc.moisan@gmail.com",
] as const;

export function emailSubject(d = new Date()): string {
  const slot = String(parisScheduleSlot(d)).padStart(2, "0");
  return `Veille emploi graphiste-DA — ${parisDateString(d)} ${slot}h`;
}

function sortHighlights(offers: JobOffer[]): JobOffer[] {
  return [...offers].sort((a, b) => {
    if (Boolean(a.isNew) !== Boolean(b.isNew)) return a.isNew ? -1 : 1;
    if (a.date === "non précisé" && b.date === "non précisé") return 0;
    if (a.date === "non précisé") return 1;
    if (b.date === "non précisé") return -1;
    return b.date.localeCompare(a.date);
  });
}

/** Jusqu’à 5 offres : nouveautés d’abord, puis dates les plus récentes. */
export function pickHighlightOffers(offers: JobOffer[], limit = 5): JobOffer[] {
  return sortHighlights(offers).slice(0, limit);
}

export function emailBody(
  summary: string,
  notionLink?: string | null,
  highlights: JobOffer[] = [],
): string {
  const lines = [
    "Bonjour,",
    "",
    "Voici la veille emploi graphiste / DA du jour.",
    "",
    summary,
  ];
  if (highlights.length) {
    lines.push("", "Offres à regarder en priorité :");
    for (const o of highlights) {
      const link = o.urls[0] ? ` — ${o.urls[0]}` : "";
      const tag = o.isNew ? " [nouveau]" : "";
      lines.push(`- ${o.company} — ${o.title}${tag}${link}`);
    }
  }
  if (notionLink) {
    lines.push("", `Base Notion : ${notionLink}`);
  }
  lines.push("", "— Agent veille emploi");
  return lines.join("\n");
}

export function activeRecipients(): string[] {
  return [...EMAIL_TO];
}
