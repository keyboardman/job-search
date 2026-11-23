# Agent veille emploi graphiste / DA

Veille d’offres graphiste et directeur·rice artistique en France — **toutes les 8 h** (04:00, 12:00, 20:00 Europe/Paris). Sources modèle = **8 h** ; RapidAPI (Indeed + Apec) = **24 h**, **uniquement à 04:00**.

## Qui fait quoi

| Sources | Qui |
|---------|-----|
| Welcome to the Jungle, LinkedIn Emplois, France Travail, Hellowork, ProfilCulture, JobCulture | **Modèle Cursor** (Navigation / recherche) → `data/offres-agent.json` (8 h) |
| **Indeed** (anti-bots) | **JSearch** RapidAPI (`/search-v2`) via `npm run veille` (24 h) |
| **Apec** | **APEC API by API.SH** RapidAPI (`/apec/v1/search`) via `npm run veille` (24 h) |

## Prérequis

- Node.js 20+
- Clé **RapidAPI** (`RAPIDAPI_KEY` dans `.env`) avec abonnements :
  - [JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
  - [APEC API by API.SH](https://rapidapi.com/CaesarRodman/api/apec-api-by-api-sh)
- **Notion** : `NOTION_TOKEN` (secret d’intégration) + `config/notion.json` — voir `docs/notion-sync.md`
- MCP **Gmail** (Cursor) pour l’email highlights (sans pièce jointe)
- Fuseau **Europe/Paris** pour le planning 04:00 / 12:00 / 20:00

## Fichiers clés

| Chemin | Rôle |
|--------|------|
| `prompts/veille-emploi-graphiste-da.md` | Brief de l’agent Cursor |
| `data/offres-agent.json` | Offres collectées par le modèle Cursor |
| `data/offres-veille.json` | Mémoire du dernier run |
| `config/notion.json` | Id / URL de la base Notion |
| `config/schedule.md` | Automation toutes les 8 h Europe/Paris |
| `src/mail.ts` | Destinataires email |
| `docs/notion-sync.md` | Sync Notion |
| `docs/email-send.md` | Envoi Gmail via MCP |

## Installation

```bash
cp .env.example .env
# renseigner RAPIDAPI_KEY et NOTION_TOKEN
npm install
```

## Lancer une veille

1. (Agent Cursor) Remplir `data/offres-agent.json` en parcourant les 6 sources modèle (fenêtre 8 h).
2. Fusion (+ Indeed + Apec à 04:00, 24 h) + sync Notion :

```bash
npm run veille          # 04:00 — JSearch + APEC API.SH + fusion agent → Notion → résumé
npm run veille:agent    # 12:00 / 20:00 — fusion agent seule (sans RapidAPI)
npm run veille:dry      # fixtures + offres-agent.json (+ tentative sync Notion)
npm run jsearch:verify  # test API Indeed
npm run apec:verify     # test APEC API by API.SH
npm test
```

Destination : base Notion (`docs/notion-sync.md`) — email : `docs/email-send.md`.

## Planning

Toutes les **8 heures** **Europe/Paris** — Automation Cursor qui suit le prompt :

| Heure | Commande | RapidAPI | Fenêtre |
|-------|----------|----------|---------|
| **04:00** | `npm run veille` | Oui | 8 h + 24 h API |
| **12:00** | `npm run veille:agent` | Non | 8 h |
| **20:00** | `npm run veille:agent` | Non | 8 h |
