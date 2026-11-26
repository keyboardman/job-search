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

  it("accepte art director et graphic designer en Île-de-France", () => {
    assert.equal(
      passesFilters({
        title: "Digital Content Art Director",
        summary: "Contenus digitaux à Paris",
        location: "Paris 75002",
        remote: "non précisé",
      }),
      true,
    );
    assert.equal(
      passesFilters({
        title: "Graphic Designer",
        summary: "Studio à Boulogne-Billancourt",
        location: "Boulogne-Billancourt 92",
        remote: "non précisé",
      }),
      true,
    );
    assert.equal(
      passesFilters({
        title: "Infographiste H/F",
        summary: "PAO",
        location: "Paris",
        remote: "aucun",
      }),
      true,
    );
  });

  it("rejette la conception de stands 3D", () => {
    assert.equal(
      passesFilters({
        title: "Designer Graphique H/F",
        summary: "Designers 3D : concevoir des stands et pop-up stores.",
        location: "Paris 18e",
        remote: "complet",
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
