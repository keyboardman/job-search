/**
 * Vérification live APEC API by API.SH (RapidAPI).
 * Usage : npm run apec:verify
 */
import { getRapidApiKey } from "../config.js";
import { searchApec } from "./client.js";

async function main() {
  if (!getRapidApiKey()) {
    console.error("RAPIDAPI_KEY absente — copier .env.example vers .env et renseigner la clé.");
    process.exitCode = 2;
    return;
  }

  const res = await searchApec({
    q: "graphiste",
    sort: "date",
    contract_type: "cdi,cdd,interim",
    page: 1,
  });

  console.log(
    `OK — total=${res.total ?? "?"} count=${res.count ?? res.jobs?.length ?? 0} next_page=${res.next_page ?? "null"}`,
  );
  const first = res.jobs?.[0];
  if (first) {
    console.log(`Exemple : ${first.title} @ ${first.company} (${first.location}) — ${first.published_at}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
