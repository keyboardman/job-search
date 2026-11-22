# Planning quotidien — 08:00 Europe/Paris

## Automation Cursor (préféré)

| Champ | Valeur |
|-------|--------|
| Nom | Veille emploi graphiste-DA |
| Déclencheur | Tous les jours à **08:00** fuseau **Europe/Paris** |
| Instructions | Suivre `prompts/veille-emploi-graphiste-da.md` : (1) parcourir les 6 sources modèle Cursor (dont Hellowork) → `data/offres-agent.json` ; (2) `npm run veille` (Indeed JSearch + Apec API.SH + fusion + Excel) ; (3) déposer via MCP Google Drive ; (4) email Gmail (`src/mail.ts`) avec Excel en PJ ; (5) résumé FR |
| Outils | Navigateur / web ; MCP Google Drive ; MCP Gmail ; secret `RAPIDAPI_KEY` |
| Repo | Ce dépôt `job-search` |

Vérifier que l’heure affichée est bien **8 h Paris**.

## Cron de secours (Indeed seul)

Sans modèle Cursor, seule la partie Indeed tourne :

```cron
0 8 * * * cd /chemin/vers/job-search && TZ=Europe/Paris /usr/bin/npm run veille >> /tmp/veille-emploi.log 2>&1
```

## Vérification

- Automation : 08:00 + Europe/Paris + lecture du prompt.
- Dry-run : `npm run veille:dry` puis run réel `npm run veille`.
