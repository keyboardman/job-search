# Sync Notion — veille emploi

## Objectif

Publier les offres retenues dans la base Notion **Veille emploi graphiste-DA** (upsert par `Offer id`). Remplace Excel + Google Drive.

## Prérequis

1. Base Notion créée (URL dans `config/notion.json`).
2. [Intégration interne](https://www.notion.so/my-integrations) → copier le **secret** (`ntn_…` ou `secret_…`).
3. Dans `.env` :

```bash
NOTION_TOKEN=ntn_xxxxxxxx
```

**Pas une URL** — l’URL de la base va uniquement dans `config/notion.json`.

4. Sur la base Notion : **⋯ → Connecter à** → choisir l’intégration.

## Propriétés attendues

| Propriété | Type |
|-----------|------|
| Nom | title |
| Intitulé du poste | rich_text |
| Date de candidature | date |
| Suivi | status ou select (`Sans réponse`, `Refus`, …) |
| Relance RH via LinkedIn | checkbox |
| Plateforme(s) | multi_select |
| Autre plateforme (à préciser) | rich_text |
| Descriptif | rich_text |
| Localisation | rich_text |
| Télétravail | select (`complet`, `partiel`, `aucun`, `non précisé`) |
| Langues | rich_text |
| Date de publication | date |
| Sources | multi_select |
| Lien | url |
| Nouveau | checkbox |
| Offer id | rich_text |

Référence modèle candidatures : `docs/notion-schema-reference.md`.

## Vérifier l’API

```bash
npx tsx -e "import { retrieveConfiguredDatabase } from './src/notion/index.ts'; retrieveConfiguredDatabase().then(console.log).catch(e=>{console.error(e); process.exit(1)})"
```

## Run

`npm run veille` / `veille:agent` / `veille:dry` synchronisent Notion après la mémoire.  
`--skip-notion` pour ignorer la sync.
