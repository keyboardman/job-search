# Proposal

## Why

Les Excel de veille sont déjà déposés dans Google Drive, mais le dépôt GitHub n’offre aucun parcours lisible des offres. Une page récapitulatif et des pages de détail par offre, alimentées uniquement depuis ces fichiers Excel Drive, rendent la veille consultable sans ouvrir les classeurs.

## What Changes

- Ajouter une génération de site statique dans le dépôt : page récapitulatif (liste des offres) et une page de détail par offre.
- Alimenter ce site **uniquement** à partir des fichiers `.xlsx` du dossier Drive « Veille emploi graphiste-DA » (pas les JSON locaux `data/offres-*.json`, pas le pipeline en mémoire).
- Agréger / dédupliquer les offres présentes dans ces Excel, puis publier les pages sur GitHub (GitHub Pages ou arborescence dédiée servie par Pages).
- Documenter le flux (téléchargement Drive → parse Excel → génération pages → commit / déploiement).

## Capabilities

### New Capabilities
- `pages-offres-github`: Site GitHub (récapitulatif + détail par offre) généré exclusivement depuis les Excel Drive de la veille.

### Modified Capabilities
- *(aucune)* — le livrable Excel / dépôt Drive existant (`export-excel-drive`) ne change pas ; ce change **lit** les Excel déjà produits.

## Impact

- Nouveau module de lecture Excel (onglet Offres) et de génération HTML/Markdown pour GitHub Pages.
- Intégration MCP Google Drive (liste + téléchargement des seuls `.xlsx` du dossier configuré dans `config/drive.json`).
- Dossier de sortie dans le dépôt (ex. `docs/` ou `site/`) + éventuelle config GitHub Pages.
- Scripts npm / doc README pour régénérer les pages ; pas de modification du format Excel ni de l’email Gmail.
