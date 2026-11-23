import ExcelJS from "exceljs";
import { offerId } from "../normalize.js";
import type { JobOffer, RemoteKind } from "../types.js";

const NON_PRECISE = "non précisé";
const REMOTE_VALUES = new Set<RemoteKind>(["complet", "partiel", "aucun", "non précisé"]);

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "object") {
    if ("text" in value && value.text != null) return String(value.text).trim();
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((r) => r.text).join("").trim();
    }
    if ("result" in value && value.result != null) return String(value.result).trim();
    if ("hyperlink" in value && typeof value.hyperlink === "string") return value.hyperlink.trim();
  }
  return "";
}

function cellHyperlink(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v && typeof v === "object" && "hyperlink" in v && typeof v.hyperlink === "string") {
    return v.hyperlink.trim();
  }
  const text = cellText(v);
  if (/^https?:\/\//i.test(text)) return text;
  return "";
}

function parseRemote(raw: string): RemoteKind {
  const v = raw.trim().toLowerCase() || NON_PRECISE;
  return REMOTE_VALUES.has(v as RemoteKind) ? (v as RemoteKind) : NON_PRECISE;
}

function parseIsNew(raw: string): boolean {
  return raw.trim().toLowerCase() === "oui";
}

function headerMap(row: ExcelJS.Row): Map<string, number> {
  const map = new Map<string, number>();
  row.eachCell({ includeEmpty: false }, (cell, col) => {
    const key = cellText(cell.value).toLowerCase();
    if (key) map.set(key, col);
  });
  return map;
}

function col(headers: Map<string, number>, name: string): number | undefined {
  return headers.get(name.toLowerCase());
}

/** Lit l’onglet « Offres » d’un classeur Excel de veille. */
export async function readOffersFromWorkbook(filePath: string): Promise<JobOffer[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const sheet = wb.getWorksheet("Offres");
  if (!sheet) return [];

  const headers = headerMap(sheet.getRow(1));
  const iCompany = col(headers, "Société");
  const iTitle = col(headers, "Intitulé");
  const iSummary = col(headers, "Descriptif");
  const iLocation = col(headers, "Localisation");
  const iRemote = col(headers, "Télétravail");
  const iLanguages = col(headers, "Langues");
  const iDate = col(headers, "Date");
  const iSources = col(headers, "Sources");
  const iUrl = col(headers, "Lien");
  const iNew = col(headers, "Nouveau");

  if (iCompany == null || iTitle == null) return [];

  const offers: JobOffer[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const company = cellText(row.getCell(iCompany).value) || NON_PRECISE;
    const title = cellText(row.getCell(iTitle).value) || NON_PRECISE;
    if (company === NON_PRECISE && title === NON_PRECISE) return;

    const location = iLocation != null ? cellText(row.getCell(iLocation).value) || NON_PRECISE : NON_PRECISE;
    const remote = iRemote != null ? parseRemote(cellText(row.getCell(iRemote).value)) : NON_PRECISE;
    const summary = iSummary != null ? cellText(row.getCell(iSummary).value) || NON_PRECISE : NON_PRECISE;
    const languages = iLanguages != null ? cellText(row.getCell(iLanguages).value) || NON_PRECISE : NON_PRECISE;
    const date = iDate != null ? cellText(row.getCell(iDate).value) || NON_PRECISE : NON_PRECISE;
    const sourcesRaw = iSources != null ? cellText(row.getCell(iSources).value) : "";
    const sources = sourcesRaw
      ? sourcesRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const url =
      iUrl != null ? cellHyperlink(row.getCell(iUrl)) || cellText(row.getCell(iUrl).value) : "";
    const isNew = iNew != null ? parseIsNew(cellText(row.getCell(iNew).value)) : false;

    offers.push({
      id: offerId(company, title, remote === "complet" ? "remote" : location),
      company,
      title,
      summary,
      location,
      remote,
      languages,
      date,
      sources,
      urls: url ? [url] : [],
      isNew,
    });
  });

  return offers;
}
