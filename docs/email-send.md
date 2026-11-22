# Envoi email Gmail — veille emploi

## Objectif

Après création de `output/Veille graphiste-DA AAAA-MM-JJ.xlsx`, envoyer un email depuis le compte Gmail authentifié (MCP Gmail) aux destinataires actifs.

## Destinataires

Liste dans `src/mail.ts` (`EMAIL_TO`) :

- `stella.moisan@gmail.com` — commentée pour l’instant
- `luc.moisan@gmail.com` — active

Pour (ré)activer Stella : décommenter sa ligne dans `EMAIL_TO`.

## Flux (agent Cursor + MCP Gmail)

1. Lire les destinataires actifs (`EMAIL_TO` / sortie console de `npm run veille`).
2. Si la liste est vide : ne pas envoyer.
3. Appeler MCP Gmail `send_message` avec :
   - `to` : destinataires actifs
   - `subject` : `Veille emploi graphiste-DA — AAAA-MM-JJ` (date Europe/Paris)
   - `body` : résumé texte + lien Drive + mention de la pièce jointe (pas de Markdown)
   - `attachments` : un élément
     - `filename` : nom du `.xlsx`
     - `mimeType` : `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     - `content` : contenu du fichier en **base64**
4. Confirmer l’envoi dans le résumé final (id / viewUrl si renvoyés).

## Prérequis

- MCP **Gmail** authentifié dans Cursor (`plugin-gmail-gmail`).
- Fichier Excel déjà écrit sous `output/`.
