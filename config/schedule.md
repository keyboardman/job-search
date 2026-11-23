# Planning — toutes les 8 h (04:00 / 12:00 / 20:00 Europe/Paris)

Trois runs par jour, espacés de 8 h. **RapidAPI (Indeed JSearch + Apec) uniquement à 04:00.**

Fenêtres de fraîcheur : sources modèle Cursor = **8 h** ; RapidAPI = **24 h**.

## Automation Cursor (préféré)

Une automation avec cron `0 4,12,20 * * *` (fuseau Europe/Paris), ou trois automations séparées.

| Créneau | Commande npm | RapidAPI | Fenêtre offres |
|---------|--------------|----------|----------------|
| **04:00** | `npm run veille` | Oui (Indeed + Apec) | 8 h (modèle) + 24 h (RapidAPI) |
| **12:00** | `npm run veille:agent` | Non | 8 h (modèle) |
| **20:00** | `npm run veille:agent` | Non | 8 h (modèle) |

| Champ | Valeur |
|-------|--------|
| Nom | Veille emploi graphiste-DA |
| Déclencheur | Tous les jours à **04:00**, **12:00** et **20:00** fuseau **Europe/Paris** (toutes les 8 h) |
| Instructions | Suivre `prompts/veille-emploi-graphiste-da.md` : (1) parcourir les 6 sources modèle Cursor (offres des **8 dernières heures**) → `data/offres-agent.json` ; (2) à **04:00** `npm run veille` (RapidAPI 24 h), à **12:00** / **20:00** `npm run veille:agent` ; (3) déposer via MCP Google Drive ; (4) email Gmail (`src/mail.ts`) avec Excel en PJ ; (5) Pages GitHub : télécharger les `.xlsx` Drive → `npm run pages:build` → commit/push `site/` (dédup + dates FR) ; (6) résumé FR |
| Outils | Navigateur / web ; MCP Google Drive ; MCP Gmail ; secret `RAPIDAPI_KEY` (créneau 04:00 uniquement) |
| Repo | Ce dépôt `job-search` |

Vérifier que les heures affichées sont bien **4 h / 12 h / 20 h Paris**.

## Cron de secours

```cron
0 4 * * * cd /chemin/vers/job-search && TZ=Europe/Paris /usr/bin/npm run veille >> /tmp/veille-emploi.log 2>&1
0 12,20 * * * cd /chemin/vers/job-search && TZ=Europe/Paris /usr/bin/npm run veille:agent >> /tmp/veille-emploi.log 2>&1
```

## Vérification

- Automation : 04:00 + 12:00 + 20:00 + Europe/Paris + lecture du prompt (RapidAPI à 04:00 seulement ; modèle = 8 h).
- Dry-run : `npm run veille:dry` ; run RapidAPI `npm run veille` ; hors 04:00 `npm run veille:agent`.
