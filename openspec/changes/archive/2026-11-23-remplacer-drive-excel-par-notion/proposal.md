# Proposal

## Why

Le livrable Excel + dépôt Google Drive et la génération Markdown GitHub ajoutent de la friction (fichier lourd, double pipeline, consultation dispersée). Notion devient la source de vérité consultable et le support de suivi candidature, tout en gardant un email court sur les offres importantes.

## What Changes

- **BREAKING** — Arrêter la génération du classeur Excel (`Veille graphiste-DA ….xlsx`) et le dépôt Google Drive.
- **BREAKING** — Arrêter la génération / mise à jour des pages Markdown GitHub (`site/`) alimentées depuis les Excel Drive.
- Créer une **nouvelle** base Notion (distincte de « Suivi des candidatures ») pour les offres de veille.
- Y reprendre les champs de suivi de la base modèle : Intitulé du poste, Date de candidature, Suivi, Relance RH via LinkedIn, Plateforme(s), Autre plateforme (à préciser), plus le titre/société.
- Y ajouter les champs offre de la veille : descriptif, localisation, télétravail, langues, date de publication/mise à jour, sources, URL(s), indicateur nouveau.
- Après chaque run, upsert les offres dans cette base (déduplication, pas de doublons).
- Conserver l’email Gmail aux destinataires actifs **sans pièce jointe Excel** : corps = offres les plus importantes + lien vers la base Notion.
- Mettre à jour le prompt, la doc et le résumé de fin de run (lien Notion à la place de Drive / pages GitHub).

## Capabilities

### New Capabilities
- `export-notion`: Base Notion de veille (schéma, upsert des offres, lien public/partagé pour consultation et email).

### Modified Capabilities
- `export-excel-drive`: Retirer Excel + dépôt Drive ; adapter l’email (pas d’xlsx, highlights + lien Notion).
- `pages-offres-github`: Retirer l’obligation de publier le récapitulatif / fiches Markdown depuis Drive.
- `agent-runtime`: Résumé de fin de run et flux prompt : Notion + email highlights à la place de Drive / pages GitHub.

## Impact

- Code : `src/excel.ts`, `src/run.ts`, `src/mail.ts`, `src/summary.ts`, module `src/pages/*`, `config/drive.json`, docs (`drive-upload`, `pages-github`, `email-send`), prompt `prompts/veille-emploi-graphiste-da.md`.
- Dépendances : Notion API (token d’intégration) ou automatisation navigateur pour créer/alimenter la base ; MCP Google Drive plus requis pour ce flux.
- Specs existantes Excel/Drive/pages GitHub : deltas de retrait / remplacement.
- Hypothèse « offres les plus importantes » : prioriser les offres marquées nouvelles (`isNew`), puis les plus récentes, plafond raisonnable (ex. 5) dans le mail.
