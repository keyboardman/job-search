# Proposal

## Why

Les sites d’emploi (notamment Indeed) bloquent souvent les robots, ce qui rend une veille manuelle quotidienne lente et incomplète. Un agent planifié à 8 h, qui agrège les offres via JSearch (Google for Jobs / RapidAPI) sans scraper les sites bloquants, doit produire chaque matin un export Excel fiable en français et le déposer sur Google Drive, avec comparaison au jour précédent.

## What Changes

- Créer un agent de veille quotidienne d’offres graphiste / directeur·rice artistique (France, 24 h, hors stages et alternances).
- Stocker le brief opérationnel dans un fichier prompt versionné dans le dépôt.
- Utiliser JSearch pour collecter les offres (Indeed, LinkedIn, etc. via Google for Jobs) ; couvrir les 8 sources imposées à chaque run (requêtes ciblées / champ publisher) et noter celles absentes ou illisibles.
- Appliquer les règles de localisation (télétravail complet vs IDF / Oise / Aisne) et dédupliquer les annonces multi-sources.
- Produire un classeur Excel daté (onglets Offres + Sources consultées) et le déposer dans le dossier Google Drive « Veille emploi graphiste-DA » via le MCP Google Drive.
- Maintenir une mémoire jour J−1 pour signaler les nouveautés, puis enregistrer la liste du jour.
- Planifier l’exécution tous les matins à 8 h (heure de Paris).
- Terminer chaque run par un résumé FR (volume, 2–3 nouveautés intéressantes, lien Drive).

## Capabilities

### New Capabilities

- `veille-offres`: critères de recherche, sources obligatoires, champs par offre, langue FR, anti-invention, déduplication et gestion des sources illisibles.
- `export-excel-drive`: format du classeur Excel et dépôt dans le dossier Google Drive cible.
- `memoire-quotidienne`: lecture de la veille précédente, marquage des nouveautés, persistance de la liste du jour.
- `agent-runtime`: fichier prompt, planification 8 h, intégration JSearch, orchestration du run et résumé final.

### Modified Capabilities

- (aucune — projet greenfield)

## Impact

- Nouveau dépôt agent (aujourd’hui uniquement OpenSpec) : fichier prompt, scripts/config agent, éventuelle automatisation Cursor / cron.
- Dépendances externes : API JSearch (RapidAPI), MCP Google Drive (déjà authentifié dans cette session), éventuellement MCP Google Sheets si génération Excel via Sheets.
- Secrets : clé RapidAPI / JSearch et accès Drive à configurer hors du dépôt.
- Dossier Drive « Veille emploi graphiste-DA » (création si absent).
- Fuseau horaire Europe/Paris pour le déclenchement 8 h et le nom de fichier `AAAA-MM-JJ`.
