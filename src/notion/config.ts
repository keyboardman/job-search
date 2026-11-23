import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../config.js";

export interface NotionConfig {
  databaseId: string;
  databaseUrl: string;
}

/** Extrait un secret d’intégration, même si la valeur contient le libellé `NOTION_TOKEN=`. */
export function parseNotionToken(raw: string | undefined): string | undefined {
  const key = raw?.trim();
  if (!key) return undefined;
  if (/^https?:\/\//i.test(key)) return undefined;
  const embedded = key.match(/(?:ntn_|secret_)[A-Za-z0-9]+/);
  if (embedded && embedded.index !== 0) return embedded[0];
  return key;
}

export function getNotionToken(): string | undefined {
  return parseNotionToken(process.env.NOTION_TOKEN);
}

export function loadNotionConfig(): NotionConfig | null {
  const p = path.join(ROOT, "config", "notion.json");
  if (!fs.existsSync(p)) return null;
  const cfg = JSON.parse(fs.readFileSync(p, "utf8")) as Partial<NotionConfig>;
  if (!cfg.databaseId || !cfg.databaseUrl) return null;
  return { databaseId: cfg.databaseId, databaseUrl: cfg.databaseUrl };
}
