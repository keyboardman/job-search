import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { writeWorkbook } from "../src/excel.js";
import { listXlsxFiles, loadOffersFromXlsxDir } from "../src/pages/aggregate.js";
import { writeSitePages } from "../src/pages/generate.js";
import { readOffersFromWorkbook } from "../src/pages/read-workbook.js";
import { offerSlug } from "../src/pages/slug.js";
import type { JobOffer, SourceStatus } from "../src/types.js";

const sampleOffer = (overrides: Partial<JobOffer> = {}): JobOffer => ({
  id: "abc",
  company: "Studio Nord",
  title: "Graphiste digital",
  summary: "Création de supports digitaux.",
  location: "Paris",
  remote: "partiel",
  languages: "français",
  date: "2026-11-22",
  sources: ["Welcome to the Jungle"],
  urls: ["https://example.com/offre"],
  isNew: true,
  ...overrides,
});

const sources: SourceStatus[] = [
  { source: "Welcome to the Jungle", count: 1, remark: "" },
];

describe("pages — lecture Excel", () => {
  let tmp: string;
  let xlsxPath: string;

  before(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pages-xlsx-"));
    xlsxPath = await writeWorkbook([sampleOffer()], sources, tmp, new Date("2026-11-22T04:00:00Z"));
  });

  after(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("lit l’onglet Offres vers JobOffer", async () => {
    const offers = await readOffersFromWorkbook(xlsxPath);
    assert.equal(offers.length, 1);
    assert.equal(offers[0].company, "Studio Nord");
    assert.equal(offers[0].title, "Graphiste digital");
    assert.equal(offers[0].summary, "Création de supports digitaux.");
    assert.equal(offers[0].location, "Paris");
    assert.equal(offers[0].remote, "partiel");
    assert.equal(offers[0].languages, "français");
    assert.equal(offers[0].date, "2026-11-22");
    assert.deepEqual(offers[0].sources, ["Welcome to the Jungle"]);
    assert.equal(offers[0].urls[0], "https://example.com/offre");
    assert.equal(offers[0].isNew, true);
  });
});

describe("pages — agrégation multi-xlsx", () => {
  let tmp: string;

  before(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pages-agg-"));
    await writeWorkbook(
      [sampleOffer({ date: "2026-11-20" })],
      sources,
      tmp,
      new Date("2026-11-22T04:00:00+01:00"),
    );
    await writeWorkbook(
      [
        sampleOffer({ date: "2026-11-22", sources: ["Indeed"] }),
        sampleOffer({
          company: "Agence Sud",
          title: "Directeur artistique",
          location: "Lyon",
          remote: "complet",
          date: "2026-11-21",
          urls: ["https://example.com/da"],
          isNew: false,
        }),
      ],
      sources,
      tmp,
      new Date("2026-11-22T12:00:00+01:00"),
    );
    fs.writeFileSync(path.join(tmp, "offres-agent.json"), JSON.stringify({ offers: [{ fake: true }] }));
    fs.writeFileSync(path.join(tmp, "notes.csv"), "a,b\n1,2\n");
  });

  after(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("liste uniquement les .xlsx", () => {
    const files = listXlsxFiles(tmp);
    assert.equal(files.length, 2);
    assert.ok(files.every((f) => f.endsWith(".xlsx")));
  });

  it("déduplique et ignore JSON / CSV voisins", async () => {
    const { offers, filesRead } = await loadOffersFromXlsxDir(tmp);
    assert.equal(filesRead.length, 2);
    assert.equal(offers.length, 2);
    const nord = offers.find((o) => o.company === "Studio Nord");
    assert.ok(nord);
    assert.ok(nord.sources.includes("Welcome to the Jungle"));
    assert.ok(nord.sources.includes("Indeed"));
    assert.equal(offers[0].date >= offers[1].date || offers[1].date === "non précisé", true);
  });
});

describe("pages — génération HTML", () => {
  let tmp: string;

  before(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pages-site-"));
  });

  after(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("écrit index, CSS et pages détail avec liens relatifs", () => {
    const offers = [
      sampleOffer(),
      sampleOffer({
        company: "Agence Sud",
        title: "Directeur artistique",
        location: "Lyon",
        remote: "complet",
        date: "2026-11-21",
        isNew: false,
        urls: ["https://example.com/da"],
      }),
    ];
    const result = writeSitePages(offers, tmp);
    assert.ok(fs.existsSync(result.indexPath));
    assert.ok(fs.existsSync(path.join(tmp, "assets", "style.css")));
    assert.equal(result.offerPaths.length, 2);

    const index = fs.readFileSync(result.indexPath, "utf8");
    assert.match(index, /Studio Nord/);
    assert.match(index, /\.\/offres\/.+\.html/);
    assert.match(index, /\.\/assets\/style\.css/);

    const slug = offerSlug(offers[0]);
    const detail = fs.readFileSync(path.join(tmp, "offres", `${slug}.html`), "utf8");
    assert.match(detail, /Création de supports digitaux/);
    assert.match(detail, /Retour au récapitulatif/);
    assert.match(detail, /\.\.\/index\.html/);
    assert.match(detail, /Nouveau<\/dt><dd>oui/);
  });

  it("écrase les pages précédentes à la régénération", () => {
    const first = writeSitePages([sampleOffer({ company: "Ancien" })], tmp);
    const oldSlug = first.slugs[0];
    assert.ok(fs.existsSync(path.join(tmp, "offres", `${oldSlug}.html`)));

    const second = writeSitePages([sampleOffer({ company: "Nouveau Studio" })], tmp);
    assert.equal(second.slugs.length, 1);
    assert.ok(!fs.existsSync(path.join(tmp, "offres", `${oldSlug}.html`)));
    const index = fs.readFileSync(second.indexPath, "utf8");
    assert.match(index, /Nouveau Studio/);
    assert.doesNotMatch(index, /Ancien/);
  });
});
