# Pages GitHub — récapitulatif et détail des offres

## Objectif

Publier dans le dépôt un récapitulatif Markdown (`site/README.md`) et une fiche Markdown par offre (`site/offres/<slug>.md`), alimentées **uniquement** par les fichiers Excel `.xlsx` du dossier Drive **Veille emploi graphiste-DA**.

Les fichiers sont visibles **directement sur GitHub** (rendu Markdown natif) — pas besoin d’activer GitHub Pages.

Les JSON locaux (`data/offres-agent.json`, `data/offres-veille.json`) ne sont **pas** une source pour ces pages.

## Prérequis

- Dossier Drive résolu dans `config/drive.json` (`folderId` / `folderUrl`)
- MCP **Google Drive** authentifié dans Cursor
- Node.js 20+

## Flux

### 1. Télécharger les Excel Drive

1. Lire `config/drive.json` pour le `folderId` du dossier « Veille emploi graphiste-DA ».
2. Via MCP Google Drive : lister le contenu du dossier.
3. Pour chaque fichier dont le nom se termine par `.xlsx` (idéalement `Veille graphiste-DA *.xlsx`) :
   - télécharger le binaire vers `data/drive-xlsx/` (dossier gitignoré) ;
   - **ignorer** Sheets Google, CSV, PDF et tout autre type.
4. Si le MCP ne peut pas télécharger le binaire `.xlsx`, exporter / déposer manuellement les classeurs dans `data/drive-xlsx/`.

Créer le dossier au besoin :

```bash
mkdir -p data/drive-xlsx
```

### 2. Générer le Markdown

```bash
npm run pages:build
# ou chemin explicite :
npm run pages:build -- --input data/drive-xlsx --out site
```

La commande échoue clairement si le dossier d’entrée est absent ou ne contient aucun `.xlsx`.

Les offres sont **dédupliquées** entre tous les Excel lus. Les dates s’affichent **en français** (ex. `22 novembre 2026`).

### 3. Committer

1. Committer le dossier `site/` (Markdown généré) — typiquement après chaque run de veille (voir le prompt).
2. Sur GitHub, ouvrir `site/README.md` pour le récapitulatif ; chaque offre a sa fiche dans `site/offres/`.

## Régénération

Après de nouveaux dépôts Excel dans Drive, répéter téléchargement → `npm run pages:build` → commit de `site/`. Une régénération écrase les fiches détail précédentes (et retire d’éventuels anciens HTML).
