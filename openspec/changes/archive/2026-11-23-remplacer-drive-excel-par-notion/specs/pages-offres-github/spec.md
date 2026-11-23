# Spec Delta

## REMOVED Requirements

### Requirement: Source exclusive Excel Drive
**Reason**: Plus d’Excel Drive ; Notion remplace la consultation des offres.
**Migration**: Consulter / synchroniser la base Notion (`export-notion`) ; ne plus lire `data/drive-xlsx/` pour publier un site.

### Requirement: Page récapitulatif
**Reason**: Le récapitulatif vit dans la vue Notion, plus dans `site/README.md`.
**Migration**: Utiliser la vue principale de la base Notion.

### Requirement: Page de détail par offre
**Reason**: Chaque offre est une page Notion ; les fiches `site/offres/*.md` ne sont plus générées.
**Migration**: Ouvrir la page Notion de l’offre.

### Requirement: Publication dans le dépôt GitHub
**Reason**: Arrêt de la génération Markdown GitHub pour la veille.
**Migration**: Retirer `pages:build` du flux de run et du prompt ; le dossier `site/` peut rester en l’état historique sans mise à jour obligatoire.
