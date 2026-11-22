# agent-runtime Specification

## Purpose

Définit le runtime de l’agent : fichier prompt versionné, planification quotidienne à 8 h, collecte via JSearch (sans scraping direct des sites bloquants), et résumé de fin de run.

## Requirements

### Requirement: Fichier prompt versionné
Le dépôt MUST contenir un fichier dédié stockant le prompt opérationnel de la veille. L’agent MUST s’appuyer sur ce fichier comme source de vérité du brief à chaque run.

#### Scenario: Prompt présent au démarrage
- **WHEN** le run démarre
- **THEN** l’agent charge le contenu du fichier prompt du dépôt avant de collecter les offres

### Requirement: Planification quotidienne 8 h
Le système MUST se déclencher tous les matins à 08:00 Europe/Paris.

#### Scenario: Déclenchement du matin
- **WHEN** il est 08:00 Europe/Paris un jour ouvré ou non
- **THEN** un run de veille est lancé selon la configuration planifiée

### Requirement: Collecte hybride Cursor + JSearch
Le modèle Cursor MUST collecter Welcome to the Jungle, LinkedIn Emplois, France Travail, Hellowork, Apec, ProfilCulture et JobCulture (fichier `data/offres-agent.json`). Le système MUST collecter Indeed via JSearch (`country=fr`, `date_posted=today` ou équivalent) sans scraping robot direct. Le run MUST fusionner les deux jeux d’offres avant export.

#### Scenario: Collecte Indeed via JSearch
- **WHEN** la partie JSearch du run s’exécute
- **THEN** les appels ciblent Indeed avec `country=fr` et un filtre de date récente

#### Scenario: Autres sources via modèle Cursor
- **WHEN** le run d’agent Cursor s’exécute
- **THEN** les sept sources non-Indeed sont parcourues par le modèle et persistées dans `offres-agent.json` avant fusion

### Requirement: Résumé de fin de run
En fin de run, le système MUST résumer en français le nombre d’offres retenues, les 2–3 nouveautés les plus intéressantes, le lien vers le fichier Drive, et la confirmation d’envoi email (destinataires). S’il n’y a aucune offre, le système MUST le dire et lister les sources consultées.

#### Scenario: Run avec offres
- **WHEN** au moins une offre est retenue
- **THEN** le résumé indique le total, jusqu’à trois nouveautés intéressantes, et le lien Drive

#### Scenario: Run sans offre
- **WHEN** aucune offre n’est retenue
- **THEN** le résumé indique l’absence d’offres et liste les sources consultées
