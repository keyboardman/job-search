import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractJobs, searchJobs } from "../src/jsearch/client.js";

describe("jsearch client", () => {
  it("extrait data tableau (ancien format)", () => {
    const jobs = extractJobs([{ job_id: "a", job_title: "Graphiste" }]);
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0]?.job_id, "a");
  });

  it("extrait data.jobs (search-v2)", () => {
    const jobs = extractJobs({
      jobs: [{ job_id: "b", job_title: "DA", job_publisher: "Indeed" }],
      cursor: null,
    });
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0]?.job_publisher, "Indeed");
  });

  it("renvoie [] si data absente ou invalide", () => {
    assert.deepEqual(extractJobs(undefined), []);
    assert.deepEqual(extractJobs({ jobs: undefined }), []);
  });

  it("parse search-v2 via searchJobs", async () => {
    process.env.RAPIDAPI_KEY = "test-key";
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          status: "OK",
          data: {
            jobs: [
              {
                job_id: "live-1",
                job_title: "Graphiste",
                employer_name: "Studio",
                job_publisher: "Indeed",
              },
            ],
            cursor: null,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    const jobs = await searchJobs(
      { query: "graphiste via Indeed", country: "fr", date_posted: "today" },
      fetchImpl as typeof fetch,
    );
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0]?.job_id, "live-1");
  });
});
