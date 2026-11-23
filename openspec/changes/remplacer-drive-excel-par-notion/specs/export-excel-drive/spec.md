# Spec Delta

## REMOVED Requirements

### Requirement: Classeur Excel daté + créneau
**Reason**: Le livrable Excel est remplacé par la base Notion.
**Migration**: Publier les offres via `export-notion` ; ne plus générer `Veille graphiste-DA ….xlsx`.

### Requirement: Onglet Offres
**Reason**: Plus de classeur Excel.
**Migration**: Les colonnes offre vivent comme propriétés Notion (voir `export-notion`).

### Requirement: Onglet Sources consultées
**Reason**: Plus de classeur Excel.
**Migration**: Le statut des sources reste dans le résumé de fin de run / mémoire locale ; pas d’onglet Excel.

### Requirement: Dépôt Google Drive
**Reason**: Notion remplace Google Drive comme destination de consultation.
**Migration**: Synchroniser vers la base Notion configurée ; retirer le dépôt Drive du flux.

## MODIFIED Requirements

### Requirement: Envoi email Gmail
Après synchronisation Notion (ou en fin de run si aucune offre), le système MUST envoyer un email depuis le compte Gmail authentifié (MCP Gmail) aux destinataires actifs listés dans `src/mail.ts`, **sans pièce jointe Excel**. Le corps MUST présenter les offres les plus importantes (nouveautés en priorité, puis dates les plus récentes, plafond de 5) et le lien vers la base Notion. Les destinataires commentés MUST être exclus.

#### Scenario: Envoi aux destinataires actifs
- **WHEN** le run est terminé et au moins un destinataire est actif
- **THEN** un email Gmail est envoyé à ces destinataires sans `.xlsx`, avec les highlights et le lien Notion dans le corps

#### Scenario: Destinataire commenté
- **WHEN** `stella.moisan@gmail.com` est commentée dans `EMAIL_TO`
- **THEN** l’email n’est pas adressé à Stella

#### Scenario: Highlights sans nouveauté
- **WHEN** aucune offre n’est marquée nouvelle mais des offres existent
- **THEN** l’email liste jusqu’à 5 offres parmi les plus récentes et inclut le lien Notion
