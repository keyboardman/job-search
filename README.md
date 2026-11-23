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
- MCP **Google Drive** (Cursor) pour le dossier « Veille emploi graphiste-DA »
- MCP **Gmail** (Cursor) pour l’envoi du Excel aux destinataires (`src/mail.ts`)
- Fuseau **Europe/Paris** pour le planning 04:00 / 12:00 / 20:00

## Fichiers clés

| Chemin | Rôle |
|--------|------|
| `prompts/veille-emploi-graphiste-da.md` | Brief de l’agent Cursor |
| `data/offres-agent.json` | Offres collectées par le modèle Cursor |
| `data/offres-veille.json` | Mémoire du dernier run |
| `config/schedule.md` | Automation toutes les 8 h Europe/Paris |
| `src/mail.ts` | Destinataires email |
| `docs/email-send.md` | Envoi Gmail via MCP |
| `docs/pages-github.md` | Pages GitHub (récap + détail) depuis Excel Drive |
| `site/` | Site statique généré (`npm run pages:build`) |

## Installation

```bash
cp .env.example .env
# renseigner RAPIDAPI_KEY
npm install
```

## Lancer une veille

1. (Agent Cursor) Remplir `data/offres-agent.json` en parcourant les 6 sources modèle (fenêtre 8 h).
2. Fusion (+ Indeed + Apec à 04:00, 24 h) + Excel :

```bash
npm run veille          # 04:00 — JSearch + APEC API.SH + fusion agent → Excel → résumé
npm run veille:agent    # 12:00 / 20:00 — fusion agent seule (sans RapidAPI)
npm run veille:dry      # fixtures + offres-agent.json
npm run jsearch:verify  # test API Indeed
npm run apec:verify     # test APEC API by API.SH
npm run pages:build     # site GitHub depuis Excel Drive (`data/drive-xlsx/`)
npm test
```

Classeur : `output/Veille graphiste-DA AAAA-MM-JJ-HH.xlsx` (`HH` = 04 / 12 / 20) — dépôt Drive : `docs/drive-upload.md` — email : `docs/email-send.md`.

## Pages GitHub

Récapitulatif + détail par offre, source = **uniquement** les `.xlsx` du dossier Drive « Veille emploi graphiste-DA » (pas les JSON locaux). Voir `docs/pages-github.md`.

```bash
mkdir -p data/drive-xlsx
# y déposer les Excel Drive (MCP Google Drive), puis :
npm run pages:build
```

Sortie : `site/README.md` et `site/offres/*.md` (dédupliquées, dates en français) — visibles directement sur GitHub. Chaque run de veille (prompt) régénère et commit `site/` après le dépôt Drive.

## Planning

Toutes les **8 heures** **Europe/Paris** — Automation Cursor qui suit le prompt :

| Heure | Commande | RapidAPI | Fenêtre |
|-------|----------|----------|---------|
| **04:00** | `npm run veille` | Oui | 8 h + 24 h API |
| **12:00** | `npm run veille:agent` | Non | 8 h |
| **20:00** | `npm run veille:agent` | Non | 8 h |

Voir `config/schedule.md`.
