# Design

## Context

Aujourd’hui `src/run.ts` écrit un Excel (`src/excel.ts`), affiche un lien Drive (`config/drive.json`), prépare un email avec pièce jointe (`src/mail.ts`), et le prompt impose ensuite MCP Drive + `npm run pages:build` → commit `site/`. Pas de client Notion dans le dépôt ; pas de MCP Notion dans Cursor. La base modèle « Suivi des candidatures » fournit le schéma de suivi à reprendre. Voir proposal.md pour la motivation.

## Goals / Non-Goals

**Goals:**
- Remplacer Excel + Drive + pages GitHub par une base Notion upsertée à chaque run.
- Garder Gmail avec un corps « highlights » + lien Notion.
- Préserver les champs de suivi humains lors des syncs suivantes.
- Documenter le schéma et la config (database id / URL + secret).

**Non-Goals:**
- Migrer l’historique Excel Drive / `site/` vers Notion en masse (sauf éventuel import manuel hors scope).
- Remplacer la mémoire locale `data/offres-veille.json`.
- Construire un MCP Notion Cursor ; l’API officielle (ou le navigateur pour la création one-shot) suffit.
- Modifier les règles de collecte / filtres (`veille-offres`).

## Decisions

### 1. Notion API pour l’upsert, navigateur pour la création initiale
- **Choix** : créer la base une fois (UI Notion / navigateur agent, utilisateur connecté), puis lire/écrire via Notion API (`NOTION_TOKEN` + `database_id` dans config / `.env`).
- **Pourquoi** : pas de MCP Notion ; l’API est stable pour upsert et filtre par propriété. La création de DB via API exige un parent page_id et une intégration partagée — plus simple de créer à la main puis partager la base avec l’intégration.
- **Alternatives** : tout faire au navigateur à chaque run (fragile) ; réutiliser la base candidatures (refusé — nouvelle base).

### 2. Schéma de propriétés (nouvelle base « Veille emploi graphiste-DA »)

| Propriété | Type (cible) | Source run |
|-----------|--------------|------------|
| Nom / Société | title | `company` |
| Intitulé du poste | rich_text | `title` |
| Date de candidature | date | vide (humain) |
| Suivi | status ou select | vide (humain) |
| Relance RH via LinkedIn | checkbox | false |
| Plateforme(s) | multi_select | vide (humain) ; options alignées modèle si visibles |
| Autre plateforme (à préciser) | rich_text | vide |
| Descriptif | rich_text | `summary` |
| Localisation | rich_text | `location` |
| Télétravail | select | `remote` |
| Langues | rich_text | `languages` |
| Date de publication | date | `date` si ISO, sinon vide + texte secours |
| Sources | multi_select ou rich_text | `sources` |
| Lien | url | première URL |
| Nouveau | checkbox | `isNew` |
| Offer id | rich_text (caché si possible) | `id` pipeline — clé d’upsert |

Les options exactes de **Suivi** / **Plateforme(s)** seront calquées sur la base modèle au moment de la création (inspection UI connectée).

### 3. Clé d’upsert
- Filtrer la database sur `Offer id` == `JobOffer.id` ; create si absent, update si présent.
- Sur update : patcher uniquement les propriétés « veille » listées ; ne pas envoyer Date de candidature / Suivi / Relance / Plateforme(s) / Autre plateforme si déjà renseignées (lecture page → merge).

### 4. Pipeline `run.ts`
1. Collecte + mémoire (inchangé).
2. Sync Notion (nouveau module `src/notion/`).
3. Plus de `writeWorkbook` / CSV Drive fallback dans le chemin nominal.
4. Email : highlights (isNew d’abord, puis date desc, max 5) + URL base ; plus d’`excelAttachment`.
5. Prompt : retirer Drive + pages GitHub ; ajouter sync Notion.

`parisDateString` / `parisScheduleSlot` restent utiles (email subject) — les extraire hors de `excel.ts` (ex. `src/schedule.ts`) pour pouvoir retirer ExcelJS du chemin critique.

### 5. Config
- `config/notion.json` : `{ "databaseId", "databaseUrl" }` (commit ok).
- Secrets : `NOTION_TOKEN` dans `.env` (gitignore).
- Déprécier `config/drive.json` et docs Drive/pages ; garder fichiers historiques ou les pointer vers Notion.

### 6. Email « offres les plus importantes »
- Ordre : `isNew === true` d’abord, puis `date` décroissante (`non précisé` en dernier).
- Plafond : 5 lignes (société — intitulé — lien).
- Lien Notion en bas du corps.

## Risks / Trade-offs

- [Pas de MCP Notion] → Mitigation : client HTTP Notion API dans le repo + doc token.
- [Écrasement des champs humains] → Mitigation : merge read-before-write sur propriétés suivi.
- [Options Suivi/Plateformes inconnues sans UI complète] → Mitigation : tâche apply « inspecter modèle connecté puis créer la base ».
- [Ancien `site/` orphelin] → Mitigation : ne plus régénérer ; laisser en place ou nettoyer dans une tâche optionnelle.
- [exceljs encore dans package.json] → Mitigation : retirer quand plus aucun lecteur pages ne s’en sert.

## Migration Plan

1. Créer la base Notion + partager avec l’intégration → renseigner `config/notion.json` + `.env`.
2. Brancher sync dans le pipeline ; désactiver Excel/Drive/pages dans prompt + docs.
3. Valider un dry-run puis un run réel (quelques offres, email sans PJ).
4. Rollback : remettre l’ancien chemin Excel/Drive depuis git si besoin (Notion peut rester en parallèle).

## Open Questions

- Options exactes des propriétés Suivi / Plateforme(s) de la base modèle (à figer à la création).
- Faut-il supprimer physiquement `site/` et la dépendance `exceljs`, ou seulement arrêter de les utiliser ?
