# Dépôt Google Drive — Veille emploi graphiste-DA

## Objectif

Déposer `output/Veille graphiste-DA AAAA-MM-JJ-HH.xlsx` (`HH` = 04 / 12 / 20) dans le dossier Drive **Veille emploi graphiste-DA**.

Dossier déjà résolu (session apply) :

- id : `1qCmXWKdYSEQE2R6tHFFYtDohO-XArSRb`
- lien : https://drive.google.com/drive/folders/1qCmXWKdYSEQE2R6tHFFYtDohO-XArSRb

## Flux principal (MCP Google Drive)

1. `search` avec `exact_name` = `Veille emploi graphiste-DA` (type dossier).
2. Si absent : `create_folder` avec ce nom (racine My Drive ou parent choisi).
3. Déposer le fichier Excel dans ce dossier.

Le grant `drive.file` peut empêcher d’écrire dans un dossier que l’app n’a pas créé : dans ce cas, créer le dossier via le MCP au premier run.

## Fallback Sheet → export xlsx

Si l’upload binaire `.xlsx` n’est pas supporté par le MCP :

1. Générer les CSV via `toSheetCsvPayload()` (`src/excel.ts`).
2. `create_file` avec `target_mime_type: application/vnd.google-apps.spreadsheet` et le CSV de l’onglet Offres (puis compléter Sources, ou deux fichiers).
3. `export_file` en format `xlsx`.
4. Placer le résultat / le Sheet dans le dossier cible (`move_or_rename` si besoin).
5. Utiliser le lien Drive du fichier pour le résumé final.

Le dry-run local produit toujours le `.xlsx` dans `output/` pour vérification hors Drive.

Dry-run Sheet déposé pendant l’apply (fallback CSV → spreadsheet) :

- https://docs.google.com/spreadsheets/d/1r0WUUiuPL1NUHM0h-lFUwB_9u0LMmQfJsnWhY_RVxts/edit?usp=drivesdk

