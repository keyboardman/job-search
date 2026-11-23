import type { JobOffer } from "../types.js";
import { createNotionClient, type NotionClient } from "./client.js";
import { getNotionToken, loadNotionConfig } from "./config.js";
import {
  OFFER_ID_PROP,
  REQUIRED_EXTRA_PROPERTIES,
  offerToCreateProperties,
  offerToVeilleProperties,
} from "./properties.js";

async function ensureSchema(client: NotionClient, databaseId: string): Promise<void> {
  const db = await client.retrieveDatabase(databaseId);
  const existing = db.properties ?? {};
  const toAdd: Record<string, unknown> = {};
  for (const [name, def] of Object.entries(REQUIRED_EXTRA_PROPERTIES)) {
    if (!existing[name]) toAdd[name] = def;
  }
  if (Object.keys(toAdd).length) {
    await client.updateDatabase(databaseId, toAdd);
  }
}

export interface NotionSyncResult {
  databaseUrl: string;
  created: number;
  updated: number;
  errors: string[];
}

export async function retrieveConfiguredDatabase(): Promise<{
  databaseId: string;
  databaseUrl: string;
  title: string;
}> {
  const token = getNotionToken();
  const cfg = loadNotionConfig();
  if (!token) {
    throw new Error(
      "NOTION_TOKEN manquant ou invalide (attendu : secret ntn_/secret_, pas une URL). Voir docs/notion-sync.md.",
    );
  }
  if (!cfg) throw new Error("config/notion.json manquant ou incomplet.");
  const client = createNotionClient(token);
  const db = await client.retrieveDatabase(cfg.databaseId);
  return { databaseId: db.id, databaseUrl: cfg.databaseUrl, title: JSON.stringify(db.title ?? []) };
}

async function upsertOne(
  client: NotionClient,
  databaseId: string,
  offer: JobOffer,
): Promise<"created" | "updated"> {
  const found = await client.queryByOfferId(databaseId, OFFER_ID_PROP, offer.id);
  const existing = found.results[0];
  if (existing) {
    await client.updatePage(existing.id, offerToVeilleProperties(offer));
    return "updated";
  }
  await client.createPage(databaseId, offerToCreateProperties(offer));
  return "created";
}

export async function syncOffersToNotion(offers: JobOffer[]): Promise<NotionSyncResult> {
  const token = getNotionToken();
  const cfg = loadNotionConfig();
  const errors: string[] = [];
  if (!token) {
    return {
      databaseUrl: cfg?.databaseUrl ?? "",
      created: 0,
      updated: 0,
      errors: [
        "NOTION_TOKEN manquant ou invalide (secret d’intégration, pas l’URL de la base).",
      ],
    };
  }
  if (!cfg) {
    return {
      databaseUrl: "",
      created: 0,
      updated: 0,
      errors: ["config/notion.json manquant ou incomplet."],
    };
  }

  const client = createNotionClient(token);
  try {
    await ensureSchema(client, cfg.databaseId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      databaseUrl: cfg.databaseUrl,
      created: 0,
      updated: 0,
      errors: [`Schéma Notion : ${msg}`],
    };
  }

  let created = 0;
  let updated = 0;
  for (const offer of offers) {
    try {
      const action = await upsertOne(client, cfg.databaseId, offer);
      if (action === "created") created += 1;
      else updated += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${offer.id}: ${msg}`);
    }
  }
  return { databaseUrl: cfg.databaseUrl, created, updated, errors };
}
