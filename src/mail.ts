import fs from "node:fs";
import path from "node:path";
import { parisDateString, parisScheduleSlot } from "./excel.js";

/**
 * Destinataires du mail de veille (envoi via MCP Gmail par l’agent Cursor).
 * Décommenter Stella quand elle doit recevoir le fichier.
 */
export const EMAIL_TO = [
  "stella.moisan@gmail.com",
  "luc.moisan@gmail.com",
] as const;

export function emailSubject(d = new Date()): string {
  const slot = String(parisScheduleSlot(d)).padStart(2, "0");
  return `Veille emploi graphiste-DA — ${parisDateString(d)} ${slot}h`;
}

export function emailBody(summary: string, driveLink?: string | null): string {
  const lines = [
    "Bonjour,",
    "",
    "Voici la veille emploi graphiste / DA du jour.",
    "",
    summary,
  ];
  if (driveLink) {
    lines.push("", `Dossier Drive : ${driveLink}`);
  }
  lines.push("", "Le fichier Excel est en pièce jointe.", "", "— Agent veille emploi");
  return lines.join("\n");
}

/** Prépare la pièce jointe pour MCP Gmail `send_message`. */
export function excelAttachment(filePath: string): {
  filename: string;
  mimeType: string;
  content: string;
} {
  const content = fs.readFileSync(filePath).toString("base64");
  return {
    filename: path.basename(filePath),
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    content,
  };
}

export function activeRecipients(): string[] {
  return [...EMAIL_TO];
}
