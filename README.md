# Agent veille emploi graphiste / DA

Veille quotidienne d’offres graphiste et directeur·rice artistique en France.

## Qui fait quoi

| Sources | Qui |
|---------|-----|
| Welcome to the Jungle, LinkedIn Emplois, France Travail, Hellowork, Apec, ProfilCulture, JobCulture | **Modèle Cursor** (Navigation / recherche) → `data/offres-agent.json` |
| **Indeed** (anti-bots) | **JSearch** RapidAPI (`/search-v2`) via `npm run veille` |

## Prérequis

- Node.js 20+
- Clé **RapidAPI** JSearch (`RAPIDAPI_KEY` dans `.env`), abonnement actif
- MCP **Google Drive** (Cursor) pour le dossier « Veille emploi graphiste-DA »
- Fuseau **Europe/Paris** pour le planning 08:00

## Fichiers clés

| Chemin | Rôle |
|--------|------|
| `prompts/veille-emploi-graphiste-da.md` | Brief de l’agent Cursor |
| `data/offres-agent.json` | Offres collectées par le modèle Cursor |
| `data/offres-veille.json` | Mémoire du dernier run |
| `config/schedule.md` | Automation 08:00 Europe/Paris |

## Installation

```bash
cp .env.example .env
# renseigner RAPIDAPI_KEY
npm install
```

## Lancer une veille

1. (Agent Cursor) Remplir `data/offres-agent.json` en parcourant les 7 sources.
2. Fusion + Indeed + Excel :

```bash
npm run veille          # JSearch Indeed + fusion agent → Excel → résumé
npm run veille:dry      # fixtures + offres-agent.json
npm run jsearch:verify  # test API Indeed
npm test
```

Classeur : `output/Veille graphiste-DA AAAA-MM-JJ.xlsx` — dépôt Drive : `docs/drive-upload.md`.

## Planning

Tous les matins à **08:00 Europe/Paris** — Automation Cursor qui suit le prompt (modèle + `npm run veille`). Voir `config/schedule.md`.
