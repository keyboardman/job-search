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

  it("accepte art director, designer graphique et maquettiste en Île-de-France", () => {
    assert.equal(
      passesFilters({
        title: "Senior Art Director",
        summary: "Campagnes digitales",
        location: "Paris",
        remote: "non précisé",
      }),
      true,
    );
    assert.equal(
      passesFilters({
        title: "Designer graphique confirmé",
        summary: "Édition",
        location: "Ville de Paris",
        remote: "non précisé",
      }),
      true,
    );
    assert.equal(
      passesFilters({
        title: "Maquettiste en édition financière",
        summary: "Mise en page",
        location: "Neuilly-sur-Seine (92)",
        remote: "non précisé",
      }),
      true,
    );
  });

  it("rejette brand designer", () => {
    assert.equal(
      passesFilters({
        title: "Brand Designer",
        summary: "Marque",
        location: "Paris",
        remote: "non précisé",
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
