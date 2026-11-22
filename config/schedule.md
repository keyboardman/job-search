# Planning — 08:00 / 13:00 / 18:00 Europe/Paris

Trois runs par jour. **RapidAPI (Indeed JSearch + Apec) uniquement à 08:00.**

## Automation Cursor (préféré)

Une automation avec cron `0 8,13,18 * * *` (fuseau Europe/Paris), ou trois automations séparées.

| Créneau | Commande npm | RapidAPI |
|---------|--------------|----------|
| **08:00** | `npm run veille` | Oui (Indeed + Apec) |
| **13:00** | `npm run veille:agent` | Non |
| **18:00** | `npm run veille:agent` | Non |

| Champ | Valeur |
|-------|--------|
| Nom | Veille emploi graphiste-DA |
| Déclencheur | Tous les jours à **08:00**, **13:00** et **18:00** fuseau **Europe/Paris** |
| Instructions | Suivre `prompts/veille-emploi-graphiste-da.md` : (1) parcourir les 6 sources modèle Cursor → `data/offres-agent.json` ; (2) à **08:00** `npm run veille`, à **13:00** / **18:00** `npm run veille:agent` ; (3) déposer via MCP Google Drive ; (4) email Gmail (`src/mail.ts`) avec Excel en PJ ; (5) résumé FR |
| Outils | Navigateur / web ; MCP Google Drive ; MCP Gmail ; secret `RAPIDAPI_KEY` (matin uniquement) |
| Repo | Ce dépôt `job-search` |

Vérifier que les heures affichées sont bien **8 h / 13 h / 18 h Paris**.

## Cron de secours

```cron
0 8 * * * cd /chemin/vers/job-search && TZ=Europe/Paris /usr/bin/npm run veille >> /tmp/veille-emploi.log 2>&1
0 13,18 * * * cd /chemin/vers/job-search && TZ=Europe/Paris /usr/bin/npm run veille:agent >> /tmp/veille-emploi.log 2>&1
```

## Vérification

- Automation : 08:00 + 13:00 + 18:00 + Europe/Paris + lecture du prompt (RapidAPI matin seulement).
- Dry-run : `npm run veille:dry` ; matin réel `npm run veille` ; après-midi `npm run veille:agent`.
