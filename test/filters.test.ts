import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { locationAllowed, passesFilters } from "../src/filters.js";

describe("filters", () => {
  it("accepte DA senior Paris", () => {
    assert.equal(
      passesFilters({
        title: "Directeur artistique senior",
        summary: "Agence à Paris",
        location: "Paris, Île-de-France",
        remote: "aucun",
      }),
      true,
    );
  });

  it("rejette stage", () => {
    assert.equal(
      passesFilters({
        title: "Graphiste stage",
        summary: "Stage PAO",
        location: "Paris",
        remote: "aucun",
      }),
      false,
    );
  });

  it("accepte full remote hors IDF", () => {
    assert.equal(locationAllowed("Lyon", "complet"), true);
  });

  it("accepte infographiste et art director en Île-de-France", () => {
    assert.equal(
      passesFilters({
        title: "Infographiste textile / Coloriste (H/F)",
        summary: "Présentiel Bobigny",
        location: "Bobigny (93)",
        remote: "aucun",
      }),
      true,
    );
    assert.equal(
      passesFilters({
        title: "CDI - Art Director (F/M)",
        summary: "Direction artistique branding",
        location: "Paris",
        remote: "non précisé",
      }),
      true,
    );
  });

  it("rejette présentiel Lyon", () => {
    assert.equal(
      passesFilters({
        title: "Graphiste",
        summary: "Présentiel",
        location: "Lyon",
        remote: "aucun",
      }),
      false,
    );
  });
});
