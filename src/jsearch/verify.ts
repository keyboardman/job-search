/**
 * Vérification live d’un appel JSearch (country=fr + query graphiste).
 * Usage : npx tsx src/jsearch/verify.ts
 */
import { getRapidApiKey } from "../config.js";
import { searchJobs } from "./client.js";

async function main() {
  if (!getRapidApiKey()) {
    console.error("RAPIDAPI_KEY absente — copier .env.example vers .env et renseigner la clé.");
    process.exitCode = 2;
    return;
  }
  const jobs = await searchJobs({
    query: "graphiste",
    country: "fr",
    date_posted: "today",
    language: "fr",
    num_pages: 1,
  });
  console.log(`OK — ${jobs.length} offre(s) renvoyée(s) pour query=graphiste country=fr date_posted=today`);
  if (jobs[0]) {
    console.log(`Exemple : ${jobs[0].job_title} @ ${jobs[0].employer_name} (${jobs[0].job_publisher})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
