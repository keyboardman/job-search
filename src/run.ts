import fs from "node:fs";
import path from "node:path";
import { PATHS, ROOT } from "./config.js";
import { writeWorkbook, workbookFileName, toSheetCsvPayload } from "./excel.js";
import { activeRecipients, emailBody, emailSubject } from "./mail.js";
import { loadMemory, markNewOffers, saveMemory } from "./memory.js";
import { collectAndFilter, mergeFixtureAndAgent, processRawJobs } from "./pipeline.js";
import { loadPrompt } from "./prompt.js";
import { buildSourceStatuses } from "./sources.js";
import { buildSummary } from "./summary.js";
import type { JSearchJob, JobOffer, SourceStatus } from "./types.js";

function loadDriveFolderUrl(): string | null {
  const drivePath = path.join(ROOT, "config", "drive.json");
  if (!fs.existsSync(drivePath)) return null;
  const cfg = JSON.parse(fs.readFileSync(drivePath, "utf8")) as { folderUrl?: string };
  return cfg.folderUrl ?? null;
}

function parseArgs(argv: string[]) {
  return {
    dryRun: argv.includes("--dry-run"),
    summaryDemo: argv.includes("--summary-demo"),
    skipSave: argv.includes("--skip-save"),
    jsearchOnly: argv.includes("--jsearch-only"),
  };
}

function loadFixtureJobs(): JSearchJob[] {
  const p = path.join(PATHS.fixturesDir, "jsearch-sample.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as JSearchJob[];
}

function demoOffers(): { offers: JobOffer[]; sources: SourceStatus[] } {
  const raw = loadFixtureJobs();
  const offers = markNewOffers(processRawJobs(raw), loadMemory());
  const sources = buildSourceStatuses(raw, []);
  return { offers, sources };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const prompt = loadPrompt();
  console.log(`Prompt chargé (${prompt.length} caractères) depuis ${PATHS.prompt}`);
  console.log(
    "Répartition : modèle Cursor → 6 sites (dont Hellowork) ; JSearch → Indeed ; APEC API by API.SH → Apec.",
  );

  if (args.summaryDemo) {
    const { offers, sources } = demoOffers();
    console.log("\n--- Résumé (avec offres fixtures) ---\n");
    console.log(buildSummary(offers, sources, "https://drive.google.com/drive/folders/demo"));
    console.log("\n--- Résumé (zéro offre) ---\n");
    console.log(buildSummary([], sources, null));
    return;
  }

  let offers: JobOffer[];
  let sources: SourceStatus[];
  let collectErrors: string[] = [];
  let apecErrors: string[] = [];

  if (args.dryRun) {
    console.log("Mode dry-run : fixtures JSearch + data/offres-agent.json.");
    const merged = mergeFixtureAndAgent(loadFixtureJobs());
    offers = merged.offers;
    sources = merged.sources;
  } else {
    const { collect, apec, offers: o, sources: s } = await collectAndFilter();
    offers = o;
    sources = s;
    collectErrors = collect.errors;
    apecErrors = apec.errors;
    if (collect.retriedQueries.length) {
      console.log(`Requêtes Indeed retentées : ${collect.retriedQueries.join(" | ")}`);
    }
    if (collect.failedQueries.length) {
      console.log(`Requêtes Indeed encore en échec : ${collect.failedQueries.join(" | ")}`);
    }
    console.log(
      `Apec (API.SH) : ${apec.jobsSeen} offre(s) vues, ${apec.pagesFetched} page(s), ${apec.detailsFetched} détail(s), ${apec.offers.length} retenue(s).`,
    );
  }

  const previous = loadMemory();
  offers = markNewOffers(offers, previous);

  const xlsxPath = await writeWorkbook(offers, sources);
  console.log(`Excel écrit : ${xlsxPath}`);

  const csv = toSheetCsvPayload(offers, sources);
  const csvDir = path.join(PATHS.outputDir, "csv-fallback");
  fs.mkdirSync(csvDir, { recursive: true });
  fs.writeFileSync(path.join(csvDir, "offres.csv"), csv.offresCsv, "utf8");
  fs.writeFileSync(path.join(csvDir, "sources.csv"), csv.sourcesCsv, "utf8");

  if (!args.skipSave && !args.dryRun) {
    saveMemory(offers);
    console.log(`Mémoire mise à jour : ${PATHS.memory}`);
  } else if (args.dryRun) {
    console.log("Mémoire non modifiée (dry-run).");
  }

  const driveLink = loadDriveFolderUrl();
  const driveHint = driveLink
    ? `Dossier Drive : ${driveLink}`
    : `Déposer « ${workbookFileName()} » dans Drive « Veille emploi graphiste-DA » (voir docs/drive-upload.md).`;
  console.log(driveHint);

  const summary = buildSummary(offers, sources, driveLink);
  console.log("\n=== Résumé ===\n");
  console.log(summary);

  const recipients = activeRecipients();
  console.log("\n=== Email Gmail (MCP) ===\n");
  if (recipients.length === 0) {
    console.log("Aucun destinataire actif dans src/mail.ts — envoi ignoré.");
  } else {
    console.log(`À : ${recipients.join(", ")}`);
    console.log(`Objet : ${emailSubject()}`);
    console.log(`Pièce jointe : ${xlsxPath}`);
    console.log("(Agent Cursor : envoyer via MCP Gmail send_message — voir docs/email-send.md)");
    console.log("\n--- Corps ---\n");
    console.log(emailBody(summary, driveLink));
  }

  if (collectErrors.length) {
    console.log("\nErreurs collecte Indeed (JSearch) :");
    for (const e of collectErrors) console.log(`- ${e}`);
  }
  if (apecErrors.length) {
    console.log("\nErreurs collecte Apec (API.SH) :");
    for (const e of apecErrors) console.log(`- ${e}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
