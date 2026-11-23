import type { JobOffer } from "../types.js";

/** Champs suivi / candidature : ne jamais les écraser à l’update. */
const FOLLOW_UP_KEYS = [
  "Date de candidature",
  "Statut",
  "Relance Linkedin",
  "Réponse",
  "Observation",
  "Type candidature",
] as const;

export const OFFER_ID_PROP = "Offer id";
/** Propriété titre de la base Veille (schéma réel). */
export const TITLE_PROP = "Intitulé";

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
  return { select: { name: name.slice(0, 100) } };
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

function languagesToMultiSelect(languages: string) {
  if (!languages || languages === "non précisé") {
    return multiSelect(["non précisé"]);
  }
  return multiSelect(languages.split(/[,;/|]/).map((s) => s.trim()).filter(Boolean));
}

/** Propriétés veille écrites à chaque upsert. */
export function offerToVeilleProperties(offer: JobOffer): Record<string, unknown> {
  return {
    [TITLE_PROP]: title(offer.title),
    Société: richText(offer.company || "non précisé"),
    Descriptif: richText(offer.summary || "non précisé"),
    Localisation: richText(offer.location || "non précisé"),
    Télétravail: select(offer.remote),
    Langues: languagesToMultiSelect(offer.languages || "non précisé"),
    "Date de l’offre": dateProp(offer.date),
    Sources: multiSelect(offer.sources.length ? offer.sources : ["non précisé"]),
    "Lien de l’offre": url(offer.urls[0]),
    Nouveau: checkbox(Boolean(offer.isNew)),
    [OFFER_ID_PROP]: richText(offer.id),
  };
}

/** Propriétés à la création (suivi laissé vide / défaut). */
export function offerToCreateProperties(offer: JobOffer): Record<string, unknown> {
  return {
    ...offerToVeilleProperties(offer),
    "Relance Linkedin": checkbox(false),
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

/** Propriétés à ajouter si absentes de la base. */
export const REQUIRED_EXTRA_PROPERTIES: Record<string, Record<string, unknown>> = {
  [OFFER_ID_PROP]: { rich_text: {} },
  Nouveau: { checkbox: {} },
};
