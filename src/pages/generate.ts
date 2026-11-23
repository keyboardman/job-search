import fs from "node:fs";
import path from "node:path";
import type { JobOffer } from "../types.js";
import { offerSlug } from "./slug.js";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SITE_CSS = `/* Veille emploi graphiste / DA — pages GitHub */
:root {
  --bg: #f6f3ee;
  --ink: #1c1917;
  --muted: #57534e;
  --line: #d6d3d1;
  --accent: #0f766e;
  --card: #fffefb;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Source Sans 3", "Segoe UI", sans-serif;
  background:
    radial-gradient(ellipse 80% 50% at 10% -10%, #dbeafe55, transparent),
    radial-gradient(ellipse 60% 40% at 100% 0%, #ccfbf155, transparent),
    var(--bg);
  color: var(--ink);
  line-height: 1.5;
}
a { color: var(--accent); }
header, main, footer {
  max-width: 52rem;
  margin: 0 auto;
  padding: 1.25rem 1.25rem;
}
header h1 {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 600;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  margin: 0 0 0.35rem;
}
header p { margin: 0; color: var(--muted); }
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card);
  border: 1px solid var(--line);
}
th, td {
  text-align: left;
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}
th {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  background: #fafaf9;
}
tr:last-child td { border-bottom: none; }
.meta { color: var(--muted); font-size: 0.95rem; }
.back { display: inline-block; margin-bottom: 1rem; }
dl {
  background: var(--card);
  border: 1px solid var(--line);
  padding: 1rem 1.25rem;
  margin: 0;
}
dt {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  margin-top: 0.85rem;
}
dt:first-child { margin-top: 0; }
dd { margin: 0.2rem 0 0; }
.empty {
  padding: 1.5rem;
  background: var(--card);
  border: 1px dashed var(--line);
  color: var(--muted);
}
footer { color: var(--muted); font-size: 0.85rem; }
`;

function layout(title: string, body: string, cssHref: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${cssHref}" />
</head>
<body>
${body}
</body>
</html>
`;
}

export function renderIndexHtml(offers: Array<{ offer: JobOffer; slug: string }>): string {
  const rows =
    offers.length === 0
      ? `<p class="empty">Aucune offre trouvée dans les Excel Drive.</p>`
      : `<table>
  <thead>
    <tr>
      <th>Société</th>
      <th>Intitulé</th>
      <th>Localisation</th>
      <th>Date</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
${offers
  .map(
    ({ offer, slug }) => `    <tr>
      <td>${escapeHtml(offer.company)}</td>
      <td>${escapeHtml(offer.title)}</td>
      <td>${escapeHtml(offer.location)}</td>
      <td>${escapeHtml(offer.date)}</td>
      <td><a href="./offres/${escapeHtml(slug)}.html">Détail</a></td>
    </tr>`,
  )
  .join("\n")}
  </tbody>
</table>`;

  const body = `  <header>
    <h1>Veille emploi graphiste / DA</h1>
    <p class="meta">${offers.length} offre${offers.length === 1 ? "" : "s"} · source Excel Drive</p>
  </header>
  <main>
${rows}
  </main>
  <footer>
    <p>Généré à partir des fichiers Excel du dossier Drive « Veille emploi graphiste-DA ».</p>
  </footer>`;

  return layout("Veille emploi graphiste / DA", body, "./assets/style.css");
}

export function renderOfferHtml(offer: JobOffer, slug: string): string {
  const url = offer.urls[0] ?? "";
  const lien = url
    ? `<a href="${escapeHtml(url)}" rel="noopener noreferrer">${escapeHtml(url)}</a>`
    : escapeHtml("non précisé");
  const body = `  <header>
    <a class="back" href="../index.html">← Retour au récapitulatif</a>
    <h1>${escapeHtml(offer.title)}</h1>
    <p class="meta">${escapeHtml(offer.company)}</p>
  </header>
  <main>
    <dl>
      <dt>Société</dt><dd>${escapeHtml(offer.company)}</dd>
      <dt>Intitulé</dt><dd>${escapeHtml(offer.title)}</dd>
      <dt>Descriptif</dt><dd>${escapeHtml(offer.summary)}</dd>
      <dt>Localisation</dt><dd>${escapeHtml(offer.location)}</dd>
      <dt>Télétravail</dt><dd>${escapeHtml(offer.remote)}</dd>
      <dt>Langues</dt><dd>${escapeHtml(offer.languages)}</dd>
      <dt>Date</dt><dd>${escapeHtml(offer.date)}</dd>
      <dt>Sources</dt><dd>${escapeHtml(offer.sources.join(", ") || "non précisé")}</dd>
      <dt>Lien</dt><dd>${lien}</dd>
      <dt>Nouveau</dt><dd>${offer.isNew ? "oui" : "non"}</dd>
    </dl>
  </main>
  <footer>
    <p>Page <code>${escapeHtml(slug)}</code> · Excel Drive</p>
  </footer>`;

  return layout(`${offer.title} — ${offer.company}`, body, "../assets/style.css");
}

export type GenerateResult = {
  indexPath: string;
  offerPaths: string[];
  slugs: string[];
};

/**
 * Écrit `site/index.html`, `site/assets/style.css` et `site/offres/<slug>.html`.
 * Une régénération écrase le contenu précédent (dossier `offres/` vidé).
 */
export function writeSitePages(offers: JobOffer[], siteDir: string): GenerateResult {
  const assetsDir = path.join(siteDir, "assets");
  const offresDir = path.join(siteDir, "offres");

  fs.mkdirSync(assetsDir, { recursive: true });
  if (fs.existsSync(offresDir)) {
    fs.rmSync(offresDir, { recursive: true, force: true });
  }
  fs.mkdirSync(offresDir, { recursive: true });

  const withSlugs = offers.map((offer) => ({ offer, slug: offerSlug(offer) }));
  const indexPath = path.join(siteDir, "index.html");
  fs.writeFileSync(indexPath, renderIndexHtml(withSlugs), "utf8");
  fs.writeFileSync(path.join(assetsDir, "style.css"), SITE_CSS, "utf8");

  const offerPaths: string[] = [];
  const slugs: string[] = [];
  for (const { offer, slug } of withSlugs) {
    const p = path.join(offresDir, `${slug}.html`);
    fs.writeFileSync(p, renderOfferHtml(offer, slug), "utf8");
    offerPaths.push(p);
    slugs.push(slug);
  }

  return { indexPath, offerPaths, slugs };
}
