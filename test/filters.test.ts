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

  it("accepte un designer digital à Paris", () => {
    assert.equal(
      passesFilters({
        title: "Designer Digital Junior H/F - CDI",
        summary: "Campagnes digitales et déclinaisons",
        location: "Paris 8e (75)",
        remote: "partiel",
      }),
      true,
    );
  });

  it("accepte un art director", () => {
    assert.equal(
      passesFilters({
        title: "Digital Content Art Director",
        summary: "Contenus digitaux",
        location: "Paris",
        remote: "non précisé",
      }),
      true,
    );
  });

  it("rejette un lead brand designer", () => {
    assert.equal(
      passesFilters({
        title: "Lead Brand Designer - CDI (H/F)",
        summary: "Identité visuelle et management d’un graphiste junior",
        location: "Paris",
        remote: "partiel",
      }),
      false,
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
