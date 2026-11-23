# pages-offres-github Specification

## Purpose

Publie sur GitHub une page récapitulatif des offres et une page de détail par offre, alimentées exclusivement par les fichiers Excel du dossier Drive de veille.

## Requirements

### Requirement: Source exclusive Excel Drive
Le système MUST construire les pages uniquement à partir des fichiers `.xlsx` présents dans le dossier Google Drive « Veille emploi graphiste-DA ». Le système MUST NOT utiliser `data/offres-agent.json`, `data/offres-veille.json`, ni le résultat en mémoire du pipeline de veille comme source des pages. Les fichiers non Excel (Sheets Google, CSV, PDF, etc.) MUST être ignorés.

#### Scenario: Seuls les xlsx sont lus
- **WHEN** le dossier Drive contient des `.xlsx` de veille et d’autres types de fichiers
- **THEN** seuls les fichiers `.xlsx` sont pris en compte pour générer les pages

#### Scenario: JSON locaux exclus
- **WHEN** des offres existent dans `data/offres-agent.json` mais aucun `.xlsx` n’est disponible dans Drive
- **THEN** aucune offre n’est publiée sur les pages à partir de ces JSON

### Requirement: Page récapitulatif
Le système MUST publier dans le dépôt GitHub une page récapitulatif listant les offres agrégées (société, intitulé, localisation, date, lien vers la page de détail). Les offres MUST être dédupliquées entre les Excel lus. Le tri MUST être par date décroissante (les dates « non précisé » en fin de liste).

#### Scenario: Liste dédupliquée
- **WHEN** la même offre apparaît dans deux fichiers Excel Drive
- **THEN** la page récapitulatif n’affiche qu’une seule entrée pour cette offre

#### Scenario: Navigation vers le détail
- **WHEN** l’utilisateur ouvre la page récapitulatif
- **THEN** chaque offre listée propose un lien vers sa page de détail dans le dépôt

### Requirement: Page de détail par offre
Le système MUST publier une page de détail par offre distincte, avec au minimum : société, intitulé, descriptif, localisation, télétravail, langues, date, sources, lien d’origine, et indicateur nouveau si présent dans l’Excel. Chaque page MUST être accessible depuis le récapitulatif et contenir un lien de retour vers celui-ci.

#### Scenario: Champs issus de l’onglet Offres
- **WHEN** une offre est lue depuis l’onglet « Offres » d’un Excel Drive
- **THEN** sa page de détail affiche les colonnes Société, Intitulé, Descriptif, Localisation, Télétravail, Langues, Date, Sources, Lien et Nouveau telles que présentes dans le classeur

#### Scenario: Retour au récapitulatif
- **WHEN** l’utilisateur consulte une page de détail
- **THEN** un lien permet de revenir à la page récapitulatif

### Requirement: Publication dans le dépôt GitHub
Le système MUST écrire la page récapitulatif et les pages de détail en Markdown dans le dépôt GitHub, consultables directement via le rendu natif GitHub (sans GitHub Pages obligatoire). Une régénération MUST écraser les pages précédentes pour refléter l’état courant des Excel Drive.

#### Scenario: Régénération à jour
- **WHEN** de nouveaux Excel ont été déposés dans Drive et la génération est relancée
- **THEN** la page récapitulatif et les pages de détail du dépôt correspondent aux offres agrégées de ces Excel
