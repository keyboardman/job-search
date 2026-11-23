# Envoi email Gmail — veille emploi

## Objectif

Après synchronisation Notion, envoyer un email depuis le compte Gmail authentifié (MCP Gmail) aux destinataires actifs — **sans pièce jointe Excel**.

## Destinataires

Liste dans `src/mail.ts` (`EMAIL_TO`). Commenter une adresse pour l’exclure.

## Flux (agent Cursor + MCP Gmail)

1. Lire les destinataires actifs (`EMAIL_TO` / sortie console de `npm run veille`).
2. Si la liste est vide : ne pas envoyer.
3. Appeler MCP Gmail `send_message` avec :
   - `to` : destinataires actifs
   - `subject` : `Veille emploi graphiste-DA — AAAA-MM-JJ HHh` (date + créneau 04 / 12 / 20 Europe/Paris)
   - `body` : résumé + jusqu’à 5 offres prioritaires (nouveautés puis dates récentes) + lien Notion (pas de Markdown)
   - **pas** de `attachments`
4. Confirmer l’envoi dans le résumé final (id / viewUrl si renvoyés).

## Prérequis

- MCP **Gmail** authentifié dans Cursor (`plugin-gmail-gmail`).
- Base Notion synchronisée (ou au moins `config/notion.json` renseigné pour le lien).
