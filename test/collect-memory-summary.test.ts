import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { collectJobs } from "../src/jsearch/queries.js";
import { JSearchError } from "../src/jsearch/client.js";
import { loadMemory, markNewOffers, saveMemory, emptyMemory } from "../src/memory.js";
import { buildSummary } from "../src/summary.js";
import { writeWorkbook, workbookFileName, parisDateString } from "../src/excel.js";
import type { JobOffer, SourceStatus } from "../src/types.js";

describe("collect retry", () => {
  it("retente puis note l’échec simulé", async () => {
    let calls = 0;
    const result = await collectJobs({
      queries: ["graphiste via Indeed"],
      failFirst: new Set(["graphiste via Indeed"]),
      searchFn: async () => {
        calls += 1;
        return [
          {
            job_id: "z",
            employer_name: "X",
            job_title: "Graphiste",
            job_publisher: "Indeed",
            job_country: "FR",
            job_city: "Paris",
          },
        ];
      },
    });
    // 1er passage : failFirst (sans searchFn) ; retry : 1 appel searchFn
    assert.equal(calls, 1);
    assert.deepEqual(result.retriedQueries, ["graphiste via Indeed"]);
    assert.equal(result.failedQueries.length, 0);
    assert.equal(result.rawJobs.length, 1);
  });

  it("garde en failed si retry échoue", async () => {
    const result = await collectJobs({
      queries: ["graphiste via LinkedIn"],
      searchFn: async () => {
        throw new JSearchError("timeout", "graphiste via LinkedIn", "AbortError");
      },
    });
    assert.deepEqual(result.failedQueries, ["graphiste via LinkedIn"]);
  });
});

describe("memory", () => {
  it("premier run = tout nouveau ; second = déjà vu", () => {
    const offer: JobOffer = {
      id: "abc",
      company: "A",
      title: "Graphiste",
      summary: "x",
      location: "Paris",
      remote: "aucun",
      languages: "non précisé",
      date: "2026-11-22",
      sources: ["Indeed"],
      urls: ["https://x"],
    };
    const first = markNewOffers([offer], emptyMemory());
    assert.equal(first[0].isNew, true);

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "veille-mem-"));
    const file = path.join(dir, "offres-veille.json");
    saveMemory(first, file);
    const loaded = loadMemory(file);
    const second = markNewOffers([offer], loaded);
    assert.equal(second[0].isNew, false);
  });
});

describe("summary & excel", () => {
  it("résumé zéro et avec offres", () => {
    const sources: SourceStatus[] = [
      { source: "Indeed", count: 0, remark: "non couverte / aucune offre via JSearch" },
    ];
    const zero = buildSummary([], sources as SourceStatus[], null);
    assert.match(zero, /Aucune offre/);
    assert.match(zero, /Indeed/);

    const offers: JobOffer[] = [
      {
        id: "1",
        company: "Studio",
        title: "Directeur artistique",
        summary: "DA",
        location: "Paris",
        remote: "complet",
        languages: "français",
        date: "2026-11-22",
        sources: ["LinkedIn Emplois"],
        urls: ["https://l"],
        isNew: true,
      },
    ];
    const withOffers = buildSummary(offers, sources as SourceStatus[], "https://drive.example/file");
    assert.match(withOffers, /1 offre/);
    assert.match(withOffers, /Directeur artistique/);
    assert.match(withOffers, /drive\.example/);
  });

  it("écrit un xlsx nommé correctement", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "veille-xlsx-"));
    const d = new Date("2026-11-22T10:00:00Z");
    const file = await writeWorkbook([], [], dir, d);
    assert.equal(path.basename(file), workbookFileName(d));
    assert.match(workbookFileName(d), new RegExp(parisDateString(d)));
    assert.ok(fs.existsSync(file));
    assert.ok(fs.statSync(file).size > 1000);
  });
});
