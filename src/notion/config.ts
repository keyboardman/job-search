import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../config.js";

export interface NotionConfig {
  databaseId: string;
  databaseUrl: string;
}

export function getNotionToken(): string | undefined {
  const key = process.env.NOTION_TOKEN?.trim();
  if (!key) return undefined;
  if (/^https?:\/\//i.test(key)) return undefined;
  return key;
}

export function loadNotionConfig(): NotionConfig | null {
  const p = path.join(ROOT, "config", "notion.json");
  if (!fs.existsSync(p)) return null;
  const cfg = JSON.parse(fs.readFileSync(p, "utf8")) as Partial<NotionConfig>;
  if (!cfg.databaseId || !cfg.databaseUrl) return null;
  return { databaseId: cfg.databaseId, databaseUrl: cfg.databaseUrl };
}
