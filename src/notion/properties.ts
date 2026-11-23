import type { JobOffer } from "../types.js";

const FOLLOW_UP_KEYS = [
  "Date de candidature",
  "Suivi",
  "Relance RH via LinkedIn",
  "Plateforme(s)",
  "Autre plateforme (à préciser)",
] as const;

export const OFFER_ID_PROP = "Offer id";
/** Propriété titre Notion (workspace FR). */
export const TITLE_PROP = "Nom";

function richText(content: string) {
  const text = content.slice(0, 2000);
  return { rich_text: [{ type: "text" as const, text: { content: text } }] };
}

function title(content: string) {
  const text = (content || "non précisé").slice(0, 2000);
  return { title: [{ type: "text" as const, text: { content: text } }] };
}

function checkbox(checked: boolean) {
  return { checkbox: checked };
}

function select(name: string) {
  return { select: { name } };
}

function multiSelect(names: string[]) {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))].slice(0, 100);
  return { multi_select: unique.map((name) => ({ name: name.slice(0, 100) })) };
}

function url(href: string | undefined) {
  if (!href) return { url: null };
  return { url: href };
}

function dateProp(isoOrText: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(isoOrText)) {
    return { date: { start: isoOrText.slice(0, 10) } };
  }
  return { date: null };
}

/** Propriétés veille écrites à chaque upsert (jamais les champs suivi humains). */
export function offerToVeilleProperties(offer: JobOffer): Record<string, unknown> {
  const props: Record<string, unknown> = {
    [TITLE_PROP]: title(offer.company),
    "Intitulé du poste": richText(offer.title),
    Descriptif: richText(offer.summary || "non précisé"),
    Localisation: richText(offer.location || "non précisé"),
    Télétravail: select(offer.remote),
    Langues: richText(offer.languages || "non précisé"),
    "Date de publication": dateProp(offer.date),
    Sources: multiSelect(offer.sources.length ? offer.sources : ["non précisé"]),
    Lien: url(offer.urls[0]),
    Nouveau: checkbox(Boolean(offer.isNew)),
    [OFFER_ID_PROP]: richText(offer.id),
  };
  return props;
}

/** Propriétés initiales à la création (suivi à vide / défaut). */
export function offerToCreateProperties(offer: JobOffer): Record<string, unknown> {
  return {
    ...offerToVeilleProperties(offer),
    "Relance RH via LinkedIn": checkbox(false),
  };
}

export function isFollowUpFilled(properties: Record<string, unknown>): boolean {
  for (const key of FOLLOW_UP_KEYS) {
    const prop = properties[key] as Record<string, unknown> | undefined;
    if (!prop) continue;
    const type = prop.type as string | undefined;
    if (type === "date" && prop.date) return true;
    if (type === "status" && (prop.status as { name?: string } | null)?.name) return true;
    if (type === "select" && (prop.select as { name?: string } | null)?.name) return true;
    if (type === "multi_select" && Array.isArray(prop.multi_select) && prop.multi_select.length > 0)
      return true;
    if (type === "checkbox" && prop.checkbox === true) return true;
    if (type === "rich_text" && Array.isArray(prop.rich_text) && prop.rich_text.length > 0) {
      const t = (prop.rich_text as Array<{ plain_text?: string }>)
        .map((r) => r.plain_text ?? "")
        .join("")
        .trim();
      if (t) return true;
    }
  }
  return false;
}
