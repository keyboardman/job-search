import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import { PATHS } from "./config.js";
import { parisDateString, parisScheduleSlot } from "./schedule.js";
import type { JobOffer, SourceStatus } from "./types.js";

export {
  parisDateString,
  parisHour,
  parisScheduleSlot,
  SCHEDULE_SLOTS,
  type ScheduleSlot,
} from "./schedule.js";

/** Ex. `Veille graphiste-DA 2026-11-22-04.xlsx` — legacy / tests. */
export function workbookFileName(d = new Date()): string {
  const slot = String(parisScheduleSlot(d)).padStart(2, "0");
  return `Veille graphiste-DA ${parisDateString(d)}-${slot}.xlsx`;
}

function sortByDateDesc(offers: JobOffer[]): JobOffer[] {
  return [...offers].sort((a, b) => {
    if (a.date === "non précisé" && b.date === "non précisé") return 0;
    if (a.date === "non précisé") return 1;
    if (b.date === "non précisé") return -1;
    return b.date.localeCompare(a.date);
  });
}

export async function writeWorkbook(
  offers: JobOffer[],
  sources: SourceStatus[],
  outDir = PATHS.outputDir,
  date = new Date(),
): Promise<string> {
  fs.mkdirSync(outDir, { recursive: true });
  const filePath = path.join(outDir, workbookFileName(date));
  const wb = new ExcelJS.Workbook();
  wb.creator = "veille-emploi-graphiste-da";
  wb.created = date;

  const offres = wb.addWorksheet("Offres");
  offres.columns = [
    { header: "Société", key: "company", width: 28 },
    { header: "Intitulé", key: "title", width: 36 },
    { header: "Descriptif", key: "summary", width: 48 },
    { header: "Localisation", key: "location", width: 24 },
    { header: "Télétravail", key: "remote", width: 14 },
    { header: "Langues", key: "languages", width: 18 },
    { header: "Date", key: "date", width: 12 },
    { header: "Sources", key: "sources", width: 28 },
    { header: "Lien", key: "url", width: 40 },
    { header: "Nouveau", key: "isNew", width: 10 },
  ];

  for (const o of sortByDateDesc(offers)) {
    const url = o.urls[0] ?? "";
    const row = offres.addRow({
      company: o.company,
      title: o.title,
      summary: o.summary,
      location: o.location,
      remote: o.remote,
      languages: o.languages,
      date: o.date,
      sources: o.sources.join(", "),
      url,
      isNew: o.isNew ? "oui" : "non",
    });
    if (url) {
      row.getCell("url").value = { text: url, hyperlink: url };
      row.getCell("url").font = { color: { argb: "FF0563C1" }, underline: true };
    }
  }
  offres.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, offers.length + 1), column: 10 },
  };
  offres.views = [{ state: "frozen", ySplit: 1 }];

  const src = wb.addWorksheet("Sources consultées");
  src.columns = [
    { header: "Source", key: "source", width: 28 },
    { header: "Offres retenues", key: "count", width: 16 },
    { header: "Remarque", key: "remark", width: 48 },
  ];
  for (const s of sources) {
    src.addRow({ source: s.source, count: s.count, remark: s.remark });
  }
  src.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, sources.length + 1), column: 3 },
  };

  await wb.xlsx.writeFile(filePath);
  return filePath;
}

/** CSV dual-onglet pour fallback Google Sheet (voir docs/drive-upload.md). */
export function toSheetCsvPayload(offers: JobOffer[], sources: SourceStatus[]): { offresCsv: string; sourcesCsv: string } {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const offresHeader = ["Société", "Intitulé", "Descriptif", "Localisation", "Télétravail", "Langues", "Date", "Sources", "Lien", "Nouveau"];
  const offresRows = sortByDateDesc(offers).map((o) =>
    [o.company, o.title, o.summary, o.location, o.remote, o.languages, o.date, o.sources.join(", "), o.urls[0] ?? "", o.isNew ? "oui" : "non"]
      .map(esc)
      .join(","),
  );
  const sourcesHeader = ["Source", "Offres retenues", "Remarque"];
  const sourcesRows = sources.map((s) => [s.source, s.count, s.remark].map(esc).join(","));
  return {
    offresCsv: [offresHeader.join(","), ...offresRows].join("\n"),
    sourcesCsv: [sourcesHeader.join(","), ...sourcesRows].join("\n"),
  };
}
