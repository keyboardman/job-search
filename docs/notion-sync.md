# Sync Notion — veille emploi

## Objectif

Publier les offres retenues dans la base Notion configurée (`config/notion.json`), upsert par `Offer id`. Remplace Excel + Google Drive.

## Prérequis

1. Base Notion créée (URL dans `config/notion.json`).
2. [Intégration interne](https://www.notion.so/my-integrations) → secret (`ntn_…` ou `secret_…`).
3. Dans `.env` :

```bash
NOTION_TOKEN=ntn_xxxxxxxx
```

**Pas une URL** — l’URL de la base va uniquement dans `config/notion.json`.

4. Sur la base Notion : **⋯ → Connecter à** → choisir l’intégration.

## Propriétés (schéma réel de la base)

| Propriété | Type | Rempli par le run |
|-----------|------|-------------------|
| Intitulé | title | oui (`title`) |
| Société | rich_text | oui |
| Descriptif | rich_text | oui |
| Localisation | rich_text | oui |
| Télétravail | select | oui |
| Langues | multi_select | oui |
| Date de l’offre | date | oui |
| Sources | multi_select | oui |
| Lien de l’offre | url | oui |
| Offer id | rich_text | oui (clé upsert ; créée auto si absente) |
| Nouveau | checkbox | oui (créée auto si absente) |
| Date de candidature | date | non (humain) |
| Statut | status | non (humain) |
| Relance Linkedin | checkbox | non (humain) |
| Réponse | select | non (humain) |
| Observation | rich_text | non (humain) |
| Type candidature | select | non (humain) |
| ID | unique_id | auto Notion |

## Vérifier l’API

```bash
npx tsx -e "import { retrieveConfiguredDatabase } from './src/notion/index.ts'; retrieveConfiguredDatabase().then(r=>console.log(r)).catch(e=>{console.error(e); process.exit(1)})"
```

## Run

`npm run veille` / `veille:agent` / `veille:dry` synchronisent Notion après la mémoire.  
`--skip-notion` pour ignorer la sync.
