# export-excel-drive Specification

## Purpose

Définit le livrable Excel daté de la veille et son dépôt dans le dossier Google Drive « Veille emploi graphiste-DA ».

## Requirements

### Requirement: Classeur Excel daté
Le système MUST produire un fichier Excel nommé `Veille graphiste-DA AAAA-MM-JJ.xlsx` (date du run, fuseau Europe/Paris).

#### Scenario: Nom du fichier du jour
- **WHEN** le run s’exécute le 22 novembre 2026 (Europe/Paris)
- **THEN** le fichier s’appelle `Veille graphiste-DA 2026-11-22.xlsx`

### Requirement: Onglet Offres
Le classeur MUST contenir un onglet « Offres » avec colonnes pour tous les champs requis, liens cliquables, filtres activés, et tri par date décroissante.

#### Scenario: Tri et filtres
- **WHEN** le classeur est généré avec plusieurs offres
- **THEN** l’onglet Offres a les filtres actifs et les lignes sont triées par date décroissante

### Requirement: Onglet Sources consultées
Le classeur MUST contenir un onglet « Sources consultées » listant chaque source obligatoire, le nombre d’offres retenues (y compris zéro), et une remarque si la source était illisible.

#### Scenario: Source sans offre
- **WHEN** Apec est consultée mais aucune offre ne passe les filtres
- **THEN** Apec apparaît avec le nombre 0 et sans remarque d’illisibilité

#### Scenario: Source illisible documentée
- **WHEN** LinkedIn Emplois reste illisible
- **THEN** la ligne LinkedIn Emplois indique 0 offres et une remarque d’illisibilité

### Requirement: Dépôt Google Drive
Le système MUST déposer le fichier Excel dans le dossier Google Drive « Veille emploi graphiste-DA ». Si le dossier n’existe pas, le système MUST le créer puis y déposer le fichier.

#### Scenario: Dépôt réussi
- **WHEN** le classeur est prêt
- **THEN** le fichier est présent dans le dossier Drive « Veille emploi graphiste-DA » et un lien accessible est disponible pour le résumé final
