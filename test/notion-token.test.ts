import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseNotionToken } from "../src/notion/config.js";

describe("parseNotionToken", () => {
  it("garde un secret ntn_ tel quel", () => {
    assert.equal(parseNotionToken("ntn_abc123"), "ntn_abc123");
  });

  it("retire un libellé NOTION_TOKEN= collé devant le secret", () => {
    assert.equal(parseNotionToken("NOTION_TOKEN=ntn_abc123"), "ntn_abc123");
  });

  it("ignore une URL", () => {
    assert.equal(parseNotionToken("https://www.notion.so/abc"), undefined);
  });
});
