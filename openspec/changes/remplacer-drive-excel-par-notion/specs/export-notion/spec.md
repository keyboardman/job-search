# Spec Delta

## Purpose

Publie et met à jour les offres de veille dans une base Notion dédiée, consultable et utilisable pour le suivi de candidature, en remplacement d’Excel et de Google Drive.

## ADDED Requirements

### Requirement: Nouvelle base Notion dédiée
Le système MUST utiliser une base Notion distincte de « Suivi des candidatures », créée pour la veille emploi graphiste/DA. La configuration MUST exposer l’identifiant (ou l’URL) de cette base pour les runs suivants.

#### Scenario: Base distincte
- **WHEN** la publication Notion est configurée
- **THEN** la cible est une base nouvelle dédiée à la veille, pas la base modèle « Suivi des candidatures »

### Requirement: Schéma — champs issus du modèle candidatures
La base MUST exposer au minimum les propriétés alignées sur « Suivi des candidatures » : titre/société (propriété titre), Intitulé du poste, Date de candidature, Suivi, Relance RH via LinkedIn, Plateforme(s), Autre plateforme (à préciser).

#### Scenario: Propriétés de suivi présentes
- **WHEN** une page offre est créée dans la base
- **THEN** les propriétés de suivi listées ci-dessus sont disponibles pour saisie manuelle ultérieure

### Requirement: Schéma — champs offre de veille
La base MUST exposer aussi : Descriptif, Localisation, Télétravail, Langues, Date de publication, Sources, Lien(s), Nouveau. Les valeurs d’offre connues MUST être renseignées à l’upsert ; les champs de suivi candidature MAY rester vides jusqu’à action humaine.

#### Scenario: Offre upsertée avec données veille
- **WHEN** une offre retenue est publiée
- **THEN** société, intitulé, descriptif, localisation, télétravail, langues, date de publication, sources, lien(s) et indicateur nouveau reflètent l’offre (ou « non précisé » si manquant)

### Requirement: Upsert sans doublon
Le système MUST créer ou mettre à jour les pages d’offres sans dupliquer une même offre déjà présente (clé stable dérivée de l’identité d’offre du pipeline). Les champs de suivi déjà remplis par un humain MUST NOT être écrasés par un run ultérieur.

#### Scenario: Offre déjà présente
- **WHEN** un run retrouve une offre déjà en base
- **THEN** la page existante est mise à jour sur les champs veille sans créer de doublon et sans effacer Suivi / Date de candidature / Relance / Plateformes déjà renseignés

#### Scenario: Nouvelle offre
- **WHEN** une offre absente de la base est retenue
- **THEN** une nouvelle page est créée avec les champs veille remplis

### Requirement: Lien Notion pour résumé et email
Le système MUST fournir une URL accessible de la base (ou de la vue principale) utilisable dans le résumé de fin de run et dans l’email.

#### Scenario: Lien disponible après sync
- **WHEN** la synchronisation Notion réussit
- **THEN** une URL Notion est disponible pour le résumé et l’email
