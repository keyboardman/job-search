import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emailBody, pickHighlightOffers } from "../src/mail.js";
import type { JobOffer } from "../src/types.js";

function offer(partial: Partial<JobOffer> & Pick<JobOffer, "id" | "company" | "title">): JobOffer {
  return {
    summary: "",
    location: "Paris",
    remote: "aucun",
    languages: "non précisé",
    date: "2026-11-22",
    sources: ["Indeed"],
    urls: ["https://example.com"],
    ...partial,
  };
}

describe("email highlights", () => {
  it("priorise les nouveautés puis la date", () => {
    const picks = pickHighlightOffers(
      [
        offer({ id: "1", company: "A", title: "Ancien", date: "2026-11-20", isNew: false }),
        offer({ id: "2", company: "B", title: "Nouveau vieux", date: "2026-11-10", isNew: true }),
        offer({ id: "3", company: "C", title: "Récent", date: "2026-11-22", isNew: false }),
      ],
      2,
    );
    assert.equal(picks[0].id, "2");
    assert.equal(picks[1].id, "3");
  });

  it("corps sans pièce jointe avec lien Notion", () => {
    const body = emailBody("1 offre.", "https://notion.example/db", [
      offer({ id: "1", company: "Studio", title: "DA", isNew: true }),
    ]);
    assert.match(body, /Studio — DA \[nouveau\]/);
    assert.match(body, /Base Notion/);
    assert.doesNotMatch(body, /pièce jointe|Excel/i);
  });
});
