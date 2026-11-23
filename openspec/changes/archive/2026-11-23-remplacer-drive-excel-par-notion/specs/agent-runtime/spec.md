# Spec Delta

## MODIFIED Requirements

### Requirement: Résumé de fin de run
En fin de run, le système MUST résumer en français le nombre d’offres retenues, les 2–3 nouveautés les plus intéressantes, le lien vers la base Notion, et la confirmation d’envoi email (destinataires, highlights sans pièce jointe). S’il n’y a aucune offre, le système MUST le dire et lister les sources consultées. Le résumé MUST NOT exiger un lien Drive ni une confirmation de mise à jour des pages GitHub `site/`.

#### Scenario: Run avec offres
- **WHEN** au moins une offre est retenue
- **THEN** le résumé indique le total, jusqu’à trois nouveautés intéressantes, et le lien Notion

#### Scenario: Run sans offre
- **WHEN** aucune offre n’est retenue
- **THEN** le résumé indique l’absence d’offres et liste les sources consultées
