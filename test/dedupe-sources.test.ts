import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dedupeOffers } from "../src/dedupe.js";
import { processRawJobs } from "../src/pipeline.js";
import { buildSourceStatuses, mapPublisherToSource } from "../src/sources.js";
import type { JobOffer, JSearchJob } from "../src/types.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures", "jsearch-sample.json");

describe("sources & dedupe", () => {
  it("mappe Indeed et LinkedIn", () => {
    assert.equal(mapPublisherToSource("Indeed"), "Indeed");
    assert.equal(mapPublisherToSource("LinkedIn"), "LinkedIn Emplois");
  });

  it("déduplique Indeed + WTTJ", () => {
    const raw = JSON.parse(fs.readFileSync(fixtures, "utf8")) as JSearchJob[];
    const offers = processRawJobs(raw);
    const pixel = offers.filter((o) => o.company === "Studio Pixel");
    assert.equal(pixel.length, 1);
    assert.ok(pixel[0].sources.includes("Indeed"));
    assert.ok(pixel[0].sources.includes("Welcome to the Jungle"));
  });

  it("liste les 8 sources même à zéro", () => {
    const statuses = buildSourceStatuses([], []);
    assert.equal(statuses.length, 8);
    assert.ok(statuses.every((s) => s.count === 0));
  });

  it("fusionne deux lignes manuelles", () => {
    const a: JobOffer = {
      id: "x",
      company: "Acme",
      title: "Graphiste",
      summary: "non précisé",
      location: "Paris",
      remote: "aucun",
      languages: "non précisé",
      date: "2026-11-22",
      sources: ["Indeed"],
      urls: ["https://a"],
    };
    const b = { ...a, sources: ["Welcome to the Jungle"], urls: ["https://b"], summary: "Créa print." };
    const out = dedupeOffers([a, b]);
    assert.equal(out.length, 1);
    assert.equal(out[0].sources.length, 2);
    assert.equal(out[0].summary, "Créa print.");
  });
});
