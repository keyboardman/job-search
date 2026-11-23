# Veille d'offres d'emploi (toutes les 8 h)

Tout le contenu produit est en français. Je lis l'anglais mais je ne le parle pas.

## Objectif

Trouver les offres de graphiste et de directeur·rice artistique (graphiste print/digital/PAO, DA junior/senior, direction artistique) publiées ou mises à jour récemment en France et encore ouvertes. Exclure les stages et les alternances (apprentissage et contrat de professionnalisation inclus).

Fenêtres de fraîcheur :

- **Sources modèle Cursor** (6 sites) : **8 dernières heures**
- **RapidAPI** (Indeed + Apec, créneau 04:00 seulement) : **24 dernières heures**

## Créneaux (Europe/Paris) — toutes les 8 h

| Heure | RapidAPI (Indeed + Apec) | Commande après collecte agent |
|-------|--------------------------|-------------------------------|
| **04:00** | Oui (fenêtre 24 h) | `npm run veille` |
| **12:00** | Non | `npm run veille:agent` |
| **20:00** | Non | `npm run veille:agent` |

À 12 h et 20 h : ne pas appeler RapidAPI ; ne pas tenter de contourner avec un autre client Indeed/Apec sauf panne du créneau 04:00 déjà notée.

## Sources — qui fait quoi

### Sites à parcourir avec le modèle Cursor (toi) — chaque créneau

Consulte toi-même (navigation / recherche web), sans inventer :

- Welcome to the Jungle
- LinkedIn Emplois
- France Travail
- Hellowork
- ProfilCulture
- JobCulture

Pour chaque site : recherche graphiste / DA, filtre **8 h** (ou « aujourd’hui » / plus récent si le site n’a pas de filtre 8 h exact — dans ce cas, ne retenir que les offres clairement dans les 8 dernières heures), applique les règles de localisation. Si trop lent, passe aux autres et reviens à la fin ; s’il reste illisible, note-le. Écris les offres retenues dans `data/offres-agent.json` (voir schéma ci-dessous).

### Sites via API RapidAPI — **uniquement à 04:00** (`npm run veille`)

- **Indeed** — JSearch (`/search-v2`) — fenêtre **24 h** (`date_posted=today` ou équivalent)
- **Apec** — APEC API by API.SH (`/apec/v1/search`, host `apec-api-by-api-sh.p.rapidapi.com`) — fenêtre **24 h**

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

Classeur Excel `Veille graphiste-DA AAAA-MM-JJ-HH.xlsx` avec `HH` = créneau `04` / `12` / `20` (onglets Offres + Sources consultées), déposé dans Google Drive « Veille emploi graphiste-DA ».

## Email

Après création du Excel (et dépôt Drive), envoyer un email **depuis Gmail** (MCP Gmail `send_message`) aux destinataires actifs dans `src/mail.ts`. Joindre le `.xlsx`, objet `Veille emploi graphiste-DA — AAAA-MM-JJ HHh`, corps = résumé + lien Drive. Détail : `docs/email-send.md`.

## Pages GitHub (mise à jour du dépôt)

Après Drive + email, publier les offres en Markdown dans `site/` (rendu natif GitHub, sans Pages). Détail : `docs/pages-github.md`.

1. Lire `config/drive.json` (`folderId`), lister le dossier Drive « Veille emploi graphiste-DA ».
2. Télécharger **tous** les `.xlsx` de veille dans `data/drive-xlsx/` (créer le dossier si besoin). Ignorer Sheets, CSV, PDF, JSON.
3. Lancer `npm run pages:build` — agrège les Excel, **déduplique** les offres (pas de doublon sur le récapitulatif), écrit `site/README.md` + `site/offres/*.md` avec les **dates en français** (ex. `22 novembre 2026`, pas `2026-11-22`).
4. Committer uniquement les fichiers générés sous `site/` (et pousser si un remote est configuré), message du type : `pages: mise à jour offres veille AAAA-MM-JJ HHh`. Ne pas committer `data/drive-xlsx/`, `.env`, ni les secrets.
5. Ne pas inventer d’offres pour le site : source exclusive = Excel Drive. Si aucun `.xlsx` téléchargeable, le noter dans le résumé et ne pas falsifier `site/`.

## Mémoire

Lire `data/offres-veille.json` (run précédent), signaler les nouveautés, puis enregistrer la liste du run.

## Déroulement du run (agent Cursor)

1. Lire ce prompt et déterminer le créneau (04:00 / 12:00 / 20:00 Europe/Paris).
2. Parcourir les 6 sources « modèle Cursor » (fenêtre **8 h**) → écrire `data/offres-agent.json`.
3. Exécuter :
   - **04:00** → `npm run veille` (JSearch Indeed + APEC API.SH, fenêtre **24 h** + fusion + Excel + mémoire + résumé)
   - **12:00** ou **20:00** → `npm run veille:agent` (fusion agent seule, sans RapidAPI)
4. Déposer le Excel via MCP Google Drive.
5. Envoyer l’email Gmail aux destinataires actifs (`src/mail.ts`) avec le Excel en pièce jointe (voir `docs/email-send.md`).
6. Mettre à jour le Markdown GitHub : télécharger les `.xlsx` Drive → `npm run pages:build` → commit (+ push) de `site/` (déduplication + dates FR ; voir section « Pages GitHub »).
7. Résumer en français : créneau, nombre d’offres, 2–3 nouveautés, lien Drive, confirmation d’envoi email, confirmation de mise à jour Markdown / commit `site/` (ou zéro offre + sources) ; préciser si RapidAPI a été utilisée (24 h) ou non, et que le modèle a filtré sur 8 h.
