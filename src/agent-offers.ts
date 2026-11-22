import fs from "node:fs";
import path from "node:path";
import { PATHS } from "./config.js";
import { offerId } from "./normalize.js";
import type { JobOffer, ObligatorySource, SourceStatus } from "./types.js";
import { OBLIGATORY_SOURCES } from "./types.js";

/** Sources parcourues par le modèle Cursor (Apec → French Job Market API ; Indeed → JSearch). */
export const AGENT_SOURCES = [
  "Welcome to the Jungle",
  "LinkedIn Emplois",
  "France Travail",
  "Hellowork",
  "ProfilCulture",
  "JobCulture",
] as const;

export interface AgentOffersFile {
  schemaVersion: number;
  collectedAt: string | null;
  sourcesStatus: Array<{ source: string; count: number; remark: string }>;
  offers: Array<{
    company: string;
    title: string;
    summary: string;
    location: string;
    remote: JobOffer["remote"];
    languages: string;
    date: string;
    sources: string[];
    urls: string[];
  }>;
}

export const AGENT_OFFERS_PATH = path.join(PATHS.memory, "..", "offres-agent.json");

export function loadAgentOffers(filePath = path.join(path.dirname(PATHS.memory), "offres-agent.json")): {
  offers: JobOffer[];
  sources: SourceStatus[];
} {
  if (!fs.existsSync(filePath)) {
    return {
      offers: [],
      sources: AGENT_SOURCES.map((source) => ({
        source: source as ObligatorySource,
        count: 0,
        remark: "fichier offres-agent.json absent",
      })),
    };
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as AgentOffersFile;
  const offers: JobOffer[] = (raw.offers ?? []).map((o) => ({
    id: offerId(o.company, o.title, o.remote === "complet" ? "remote" : o.location),
    company: o.company || "non précisé",
    title: o.title || "non précisé",
    summary: o.summary || "non précisé",
    location: o.location || "non précisé",
    remote: o.remote || "non précisé",
    languages: o.languages || "non précisé",
    date: o.date || "non précisé",
    sources: o.sources?.length ? o.sources : ["non précisé"],
    urls: o.urls ?? [],
  }));

  const fromFile = new Map((raw.sourcesStatus ?? []).map((s) => [s.source, s]));
  const sources: SourceStatus[] = AGENT_SOURCES.map((source) => {
    const hit = fromFile.get(source);
    return {
      source: source as ObligatorySource,
      count: hit?.count ?? offers.filter((o) => o.sources.includes(source)).length,
      remark: hit?.remark ?? "",
    };
  });

  return { offers, sources };
}

export function mergeSourceStatuses(parts: SourceStatus[][]): SourceStatus[] {
  const map = new Map<ObligatorySource, SourceStatus>();
  for (const s of OBLIGATORY_SOURCES) {
    map.set(s, { source: s, count: 0, remark: "" });
  }
  for (const list of parts) {
    for (const s of list) {
      if (!(OBLIGATORY_SOURCES as readonly string[]).includes(s.source)) continue;
      const cur = map.get(s.source as ObligatorySource)!;
      cur.count += s.count;
      if (s.remark && !cur.remark) cur.remark = s.remark;
      if (cur.count > 0 && cur.remark.startsWith("non couverte")) cur.remark = "";
      if (cur.count > 0 && cur.remark.startsWith("en attente")) cur.remark = "";
      if (cur.count > 0 && cur.remark.includes("absent")) cur.remark = "";
    }
  }
  return OBLIGATORY_SOURCES.map((s) => map.get(s)!);
}
