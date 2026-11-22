import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { searchApec } from "../src/apec/client.js";
import {
  fromApecSearchJob,
  isExcludedContract,
  isRecentApecJob,
} from "../src/apec/normalize.js";
import { collectApecOffers } from "../src/apec/queries.js";

describe("apec normalize", () => {
  it("exclut stage/alternance", () => {
    assert.equal(isExcludedContract("stage"), true);
    assert.equal(isExcludedContract("alternance"), true);
    assert.equal(isExcludedContract("cdi"), false);
  });

  it("filtre les offres récentes", () => {
    const now = Date.parse("2026-11-22T12:00:00Z");
    assert.equal(
      isRecentApecJob({ published_at: "2026-11-22T10:00:00.000+0000" }, 24, now),
      true,
    );
    assert.equal(
      isRecentApecJob({ published_at: "2026-11-20T10:00:00.000+0000" }, 24, now),
      false,
    );
  });

  it("mappe une offre search", () => {
    const offer = fromApecSearchJob(
      {
        id: "1",
        title: "Graphiste F/H",
        company: "Studio",
        location: "Paris - 75",
        snippet: "Création print. Anglais apprécié.",
        contract_type: "cdi",
        published_at: "2026-11-22T08:00:00.000+0000",
        url: "https://www.apec.fr/offre/1",
        remote_id: null,
      },
      new Map(),
    );
    assert.equal(offer.sources[0], "Apec");
    assert.equal(offer.title, "Graphiste F/H");
    assert.equal(offer.location, "Paris - 75");
    assert.match(offer.languages, /anglais/i);
  });
});

describe("apec client", () => {
  it("parse search RapidAPI", async () => {
    process.env.RAPIDAPI_KEY = "test-key";
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          total: 1,
          count: 1,
          next_page: null,
          jobs: [{ id: "x", title: "Graphiste", company: "A", location: "Paris - 75" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    const res = await searchApec({ q: "graphiste" }, fetchImpl as typeof fetch);
    assert.equal(res.jobs?.[0]?.id, "x");
  });
});

describe("apec collect", () => {
  it("filtre et retient les offres récentes", async () => {
    const nowIso = new Date().toISOString().replace("Z", "+0000");
    const searchFn = async () => ({
      total: 2,
      count: 2,
      next_page: null as number | null,
      facets: { remote: [{ id: 1, name: "télétravail partiel" }] },
      jobs: [
        {
          id: "ok",
          title: "Graphiste print H/F",
          company: "Studio Nord",
          location: "Paris - 75",
          snippet: "Mise en page.",
          contract_type: "cdi",
          published_at: nowIso,
          url: "https://www.apec.fr/ok",
          remote_id: 1,
        },
        {
          id: "old",
          title: "Graphiste H/F",
          company: "Old Co",
          location: "Paris - 75",
          snippet: "Ancienne offre",
          contract_type: "cdi",
          published_at: "2020-01-01T00:00:00.000+0000",
          url: "https://www.apec.fr/old",
        },
      ],
    });

    const result = await collectApecOffers({
      queries: ["graphiste"],
      searchFn: searchFn as never,
      maxPages: 1,
      maxDetails: 0,
      recentHours: 24,
    });

    assert.equal(result.offers.length, 1);
    assert.equal(result.offers[0]?.title, "Graphiste print H/F");
    assert.equal(result.offers[0]?.remote, "partiel");
  });
});
