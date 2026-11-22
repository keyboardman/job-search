# Agent veille emploi graphiste / DA

Veille d’offres graphiste et directeur·rice artistique en France — **3 runs / jour** (08:00, 13:00, 18:00 Europe/Paris). RapidAPI (Indeed + Apec) **uniquement le matin**.

## Qui fait quoi

| Sources | Qui |
|---------|-----|
| Welcome to the Jungle, LinkedIn Emplois, France Travail, Hellowork, ProfilCulture, JobCulture | **Modèle Cursor** (Navigation / recherche) → `data/offres-agent.json` |
| **Indeed** (anti-bots) | **JSearch** RapidAPI (`/search-v2`) via `npm run veille` |
| **Apec** | **APEC API by API.SH** RapidAPI (`/apec/v1/search`) via `npm run veille` |

## Prérequis

- Node.js 20+
- Clé **RapidAPI** (`RAPIDAPI_KEY` dans `.env`) avec abonnements :
  - [JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
  - [APEC API by API.SH](https://rapidapi.com/CaesarRodman/api/apec-api-by-api-sh)
- MCP **Google Drive** (Cursor) pour le dossier « Veille emploi graphiste-DA »
- MCP **Gmail** (Cursor) pour l’envoi du Excel aux destinataires (`src/mail.ts`)
- Fuseau **Europe/Paris** pour le planning 08:00 / 13:00 / 18:00

## Fichiers clés

| Chemin | Rôle |
|--------|------|
| `prompts/veille-emploi-graphiste-da.md` | Brief de l’agent Cursor |
| `data/offres-agent.json` | Offres collectées par le modèle Cursor |
| `data/offres-veille.json` | Mémoire du dernier run |
| `config/schedule.md` | Automation 08:00 / 13:00 / 18:00 Europe/Paris |
| `src/mail.ts` | Destinataires email (Stella commentée) |
| `docs/email-send.md` | Envoi Gmail via MCP |

## Installation

```bash
cp .env.example .env
# renseigner RAPIDAPI_KEY
npm install
```

## Lancer une veille

1. (Agent Cursor) Remplir `data/offres-agent.json` en parcourant les 6 sources modèle.
2. Fusion (+ Indeed + Apec le matin) + Excel :

```bash
npm run veille          # 08:00 — JSearch + APEC API.SH + fusion agent → Excel → résumé
npm run veille:agent    # 13:00 / 18:00 — fusion agent seule (sans RapidAPI)
npm run veille:dry      # fixtures + offres-agent.json
npm run jsearch:verify  # test API Indeed
npm run apec:verify     # test APEC API by API.SH
npm test
```

Classeur : `output/Veille graphiste-DA AAAA-MM-JJ.xlsx` — dépôt Drive : `docs/drive-upload.md` — email : `docs/email-send.md`.

## Planning

Trois fois par jour **Europe/Paris** — Automation Cursor qui suit le prompt :

| Heure | Commande | RapidAPI |
|-------|----------|----------|
| **08:00** | `npm run veille` | Oui |
| **13:00** | `npm run veille:agent` | Non |
| **18:00** | `npm run veille:agent` | Non |

Voir `config/schedule.md`.
