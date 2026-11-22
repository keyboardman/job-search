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
- ProfilCulture
- JobCulture

Pour chaque site : recherche graphiste / DA, filtre 24 h si possible, applique les règles de localisation. Si trop lent, passe aux autres et reviens à la fin ; s’il reste illisible, note-le. Écris les offres retenues dans `data/offres-agent.json` (voir schéma ci-dessous).

### Sites via API RapidAPI (`npm run veille`)

- **Indeed** — JSearch (`/search-v2`)
- **Apec** — APEC API by API.SH (`/apec/v1/search`, host `apec-api-by-api-sh.p.rapidapi.com`)

Ne pas re-parcourir Apec à la main sauf si l’API est en panne et que tu peux le lire autrement.

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

Lister les 6 sources « modèle Cursor » dans `sourcesStatus` même à zéro (pas Apec / Indeed).

## Localisation

- Télétravail complet : partout en France.
- Télétravail partiel, aucun ou non précisé : uniquement Île-de-France, Oise (60) ou Aisne (02).

## Champs par offre

Société, intitulé, bref descriptif (1-2 phrases), localisation, télétravail (complet / partiel / aucun / non précisé), langues demandées, date de publication ou de mise à jour, source(s), lien cliquable. Dédupliquer : une annonce sur plusieurs sites = une seule ligne listant toutes les sources.

## Export

Classeur Excel `Veille graphiste-DA AAAA-MM-JJ.xlsx` (onglets Offres + Sources consultées), déposé dans Google Drive « Veille emploi graphiste-DA ».

## Email

Après création du Excel (et dépôt Drive), envoyer un email **depuis Gmail** (MCP Gmail `send_message`) aux destinataires actifs dans `src/mail.ts` (Stella commentée pour l’instant → seul `luc.moisan@gmail.com`). Joindre le `.xlsx`, objet `Veille emploi graphiste-DA — AAAA-MM-JJ`, corps = résumé + lien Drive. Détail : `docs/email-send.md`.

## Mémoire

Lire `data/offres-veille.json` (jour précédent), signaler les nouveautés, puis enregistrer la liste du jour.

## Déroulement du run (agent Cursor)

1. Lire ce prompt.
2. Parcourir les 6 sources « modèle Cursor » → écrire `data/offres-agent.json`.
3. Exécuter `npm run veille` (JSearch Indeed + APEC API by API.SH + fusion agent + filtres + Excel + mémoire + résumé).
4. Déposer le Excel via MCP Google Drive.
5. Envoyer l’email Gmail aux destinataires actifs (`src/mail.ts`) avec le Excel en pièce jointe (voir `docs/email-send.md`).
6. Résumer en français : nombre d’offres, 2–3 nouveautés, lien Drive, confirmation d’envoi email (ou zéro offre + sources).
