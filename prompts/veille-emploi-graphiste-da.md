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

## Export Notion

Synchroniser les offres dans la base Notion configurée (`config/notion.json`, secret `NOTION_TOKEN` dans `.env`). Upsert par `Offer id` sans écraser le suivi candidature déjà rempli. Détail : `docs/notion-sync.md`.

Ne plus générer d’Excel ni déposer sur Google Drive. Ne plus générer de pages d’offres sur GitHub.

## Email

Après sync Notion, envoyer un email **depuis Gmail** (MCP Gmail `send_message`) aux destinataires actifs dans `src/mail.ts`. **Sans pièce jointe**. Objet `Veille emploi graphiste-DA — AAAA-MM-JJ HHh`, corps = résumé + jusqu’à 5 offres prioritaires (nouveautés puis dates récentes) + lien Notion. Détail : `docs/email-send.md`.

## Mémoire

Lire `data/offres-veille.json` (run précédent), signaler les nouveautés, puis enregistrer la liste du run.

## Déroulement du run (agent Cursor)

1. Lire ce prompt et déterminer le créneau (04:00 / 12:00 / 20:00 Europe/Paris).
2. Parcourir les 6 sources « modèle Cursor » (fenêtre **8 h**) → écrire `data/offres-agent.json`.
3. Exécuter :
   - **04:00** → `npm run veille` (JSearch Indeed + APEC API.SH, fenêtre **24 h** + fusion + sync Notion + mémoire + résumé)
   - **12:00** ou **20:00** → `npm run veille:agent` (fusion agent seule, sans RapidAPI)
4. Vérifier la sync Notion (créées / mises à jour) ; si `NOTION_TOKEN` manquant, le noter.
5. Envoyer l’email Gmail aux destinataires actifs (`src/mail.ts`) sans pièce jointe (voir `docs/email-send.md`).
6. Résumer en français : créneau, nombre d’offres, 2–3 nouveautés, lien Notion, confirmation d’envoi email (ou zéro offre + sources) ; préciser si RapidAPI a été utilisée (24 h) ou non, et que le modèle a filtré sur 8 h.
