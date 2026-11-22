import fs from "node:fs";
import { PATHS } from "./config.js";

export function loadPrompt(filePath = PATHS.prompt): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier prompt introuvable : ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}
