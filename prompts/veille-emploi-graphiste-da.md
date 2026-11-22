# Veille quotidienne d'offres d'emploi

Tout le contenu produit est en français. Je lis l'anglais mais je ne le parle pas.

## Objectif

Trouver les offres de graphiste et de directeur·rice artistique (graphiste print/digital/PAO, DA junior/senior, direction artistique) publiées ou mises à jour au cours des derniers 24 heures en France et encore ouvertes. Exclure les stages et les alternances (apprentissage et contrat de professionnalisation inclus).

## Sources — qui fait quoi

### Sites à parcourir avec le modèle Cursor (toi)

Consulte toi-même (navigation / recherche web), sans inventer :

- Welcome to the Jungle
- LinkedIn Emplois
- France Travail
- Hellowork
- Apec
- ProfilCulture
- JobCulture

Pour chaque site : recherche graphiste / DA, filtre 24 h si possible, applique les règles de localisation. Si trop lent, passe aux autres et reviens à la fin ; s’il reste illisible, note-le. Écris les offres retenues dans `data/offres-agent.json` (voir schéma ci-dessous).

### Site via JSearch (anti-bots)

- **Indeed** uniquement — lancer `npm run veille:jsearch` (ou le run fusionné `npm run veille` après avoir rempli `offres-agent.json`).

Ne jamais inventer une offre, une date ou un détail. Écrire « non précisé » si l’info manque.

## Schéma `data/offres-agent.json`

```json
{
  "schemaVersion": 1,
  "collectedAt": "AAAA-MM-JJTHH:MM:SSZ",
  "sourcesStatus": [
    { "source": "Welcome to the Jungle", "count": 0, "remark": "" }
  ],
  "offers": [
    {
      "company": "",
      "title": "",
      "summary": "",
      "location": "",
      "remote": "complet | partiel | aucun | non précisé",
      "languages": "non précisé",
      "date": "AAAA-MM-JJ",
      "sources": ["Welcome to the Jungle"],
      "urls": ["https://..."]
    }
  ]
}
```

Lister les 7 sources « modèle Cursor » dans `sourcesStatus` même à zéro.

## Localisation

- Télétravail complet : partout en France.
- Télétravail partiel, aucun ou non précisé : uniquement Île-de-France, Oise (60) ou Aisne (02).

## Champs par offre

Société, intitulé, bref descriptif (1-2 phrases), localisation, télétravail (complet / partiel / aucun / non précisé), langues demandées, date de publication ou de mise à jour, source(s), lien cliquable. Dédupliquer : une annonce sur plusieurs sites = une seule ligne listant toutes les sources.

## Export

Classeur Excel `Veille graphiste-DA AAAA-MM-JJ.xlsx` (onglets Offres + Sources consultées), déposé dans Google Drive « Veille emploi graphiste-DA ».

## Mémoire

Lire `data/offres-veille.json` (jour précédent), signaler les nouveautés, puis enregistrer la liste du jour.

## Déroulement du run (agent Cursor)

1. Lire ce prompt.
2. Parcourir les 7 sources « modèle Cursor » → écrire `data/offres-agent.json`.
3. Exécuter `npm run veille` (JSearch Indeed + fusion agent + filtres + Excel + mémoire + résumé).
4. Déposer le Excel via MCP Google Drive.
5. Résumer en français : nombre d’offres, 2–3 nouveautés, lien Drive (ou zéro offre + sources).
