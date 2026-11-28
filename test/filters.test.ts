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

  it("accepte Art Director et directeur·rice artistique à Paris", () => {
    assert.equal(
      passesFilters({
        title: "CDI - Art Director (F/M)",
        summary: "Direction de création à Paris",
        location: "Paris",
        remote: "non précisé",
      }),
      true,
    );
    assert.equal(
      passesFilters({
        title: "Directeur·rice artistique",
        summary: "Studio à Paris",
        location: "Paris",
        remote: "aucun",
      }),
      true,
    );
  });

  it("rejette un brand designer", () => {
    assert.equal(
      passesFilters({
        title: "Senior Brand Designer",
        summary: "Identité visuelle",
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
