import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../config.js";
import { loadOffersFromXlsxDir } from "./aggregate.js";
import { writeSitePages } from "./generate.js";

function parseArgs(argv: string[]) {
  const inputIdx = argv.indexOf("--input");
  const outIdx = argv.indexOf("--out");
  return {
    inputDir:
      inputIdx >= 0 && argv[inputIdx + 1]
        ? path.resolve(argv[inputIdx + 1])
        : PATHS.driveXlsxDir,
    outDir:
      outIdx >= 0 && argv[outIdx + 1] ? path.resolve(argv[outIdx + 1]) : PATHS.siteDir,
  };
}

async function main(): Promise<void> {
  const { inputDir, outDir } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(inputDir)) {
    console.error(
      `Dossier d'entrée introuvable : ${inputDir}\n` +
        `Placez les Excel Drive dans data/drive-xlsx/ (voir docs/pages-github.md) ` +
        `ou passez --input <chemin>.`,
    );
    process.exit(1);
  }

  const { offers, filesRead } = await loadOffersFromXlsxDir(inputDir);
  if (filesRead.length === 0) {
    console.error(
      `Aucun fichier .xlsx dans ${inputDir}.\n` +
        `Téléchargez les Excel du dossier Drive « Veille emploi graphiste-DA » ` +
        `vers ce dossier (docs/pages-github.md).`,
    );
    process.exit(1);
  }

  const result = writeSitePages(offers, outDir);
  console.log(`Fichiers Excel lus : ${filesRead.length}`);
  for (const f of filesRead) console.log(`  - ${path.basename(f)}`);
  console.log(`Offres agrégées : ${offers.length}`);
  console.log(`Site généré : ${result.indexPath}`);
  console.log(`Pages détail : ${result.offerPaths.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
