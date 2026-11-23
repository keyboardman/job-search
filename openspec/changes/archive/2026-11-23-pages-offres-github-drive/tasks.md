# Tasks

## 1. Cache Drive et lecture Excel

- [x] 1.1 Ajouter `data/drive-xlsx/` au `.gitignore` et un chemin `PATHS` / CLI `--input` pour le cache Excel ; vérifier que le dossier n’est pas suivi par git
- [x] 1.2 Implémenter `src/pages/read-workbook.ts` : lire l’onglet « Offres » d’un `.xlsx`, mapper les colonnes vers une structure compatible `JobOffer` ; vérifier avec un test sur un fixture xlsx (ou copie de `output/*.xlsx`)
- [x] 1.3 Implémenter l’agrégation multi-fichiers : lister uniquement `*.xlsx` du dossier d’entrée, ignorer le reste, dédupliquer via `dedupeOffers`, trier par date décroissante ; vérifier qu’un JSON voisin n’est jamais lu

## 2. Génération des pages GitHub

- [x] 2.1 Générer `site/index.html` (récapitulatif : société, intitulé, localisation, date, lien détail) et `site/assets/style.css` ; vérifier le rendu local et les liens relatifs
- [x] 2.2 Générer une page `site/offres/<slug>.html` par offre avec tous les champs Excel + lien retour ; vérifier qu’une régénération écrase le contenu précédent
- [x] 2.3 Ajouter `npm run pages:build` (entrypoint `src/pages/build.ts`) documenté ; vérifier que la commande échoue clairement si le dossier d’entrée est vide / absent

## 3. Documentation et validation

- [x] 3.1 Rédiger `docs/pages-github.md` (MCP Drive : lister le dossier `config/drive.json`, télécharger uniquement les `.xlsx` vers `data/drive-xlsx/`, lancer `pages:build`, committer `site/`, activer Pages sur `/site`) ; vérifier que les étapes correspondent au flux réel
- [x] 3.2 Mettre à jour le README (section pages GitHub + script) ; vérifier que les commandes documentées existent dans `package.json`
- [x] 3.3 Ajouter/étendre les tests (lecture, dédup multi-xlsx, génération HTML) et lancer `npm test` ; vérifier le vert

## Workflow follow-up

- Archive le change OpenSpec une fois l’implémentation revue.
- Activer GitHub Pages sur le dossier `/site` après le premier commit des pages générées.
