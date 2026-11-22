# agent-runtime Specification

## Purpose

Définit le runtime de l’agent : fichier prompt versionné, planification toutes les 8 h (04:00 / 12:00 / 20:00), collecte via JSearch à 04:00 uniquement (sans scraping direct des sites bloquants), et résumé de fin de run.

## Requirements

### Requirement: Fichier prompt versionné
Le dépôt MUST contenir un fichier dédié stockant le prompt opérationnel de la veille. L’agent MUST s’appuyer sur ce fichier comme source de vérité du brief à chaque run.

#### Scenario: Prompt présent au démarrage
- **WHEN** le run démarre
- **THEN** l’agent charge le contenu du fichier prompt du dépôt avant de collecter les offres

### Requirement: Planification toutes les 8 h
Le système MUST se déclencher toutes les 8 heures à 04:00, 12:00 et 20:00 Europe/Paris.

#### Scenario: Déclenchement 04:00
- **WHEN** il est 04:00 Europe/Paris
- **THEN** un run de veille complet (modèle + RapidAPI) est lancé

#### Scenario: Déclenchement hors 04:00
- **WHEN** il est 12:00 ou 20:00 Europe/Paris
- **THEN** un run de veille modèle seul (`npm run veille:agent`, sans RapidAPI) est lancé

### Requirement: Collecte hybride Cursor + JSearch
Le modèle Cursor MUST collecter Welcome to the Jungle, LinkedIn Emplois, France Travail, Hellowork, ProfilCulture et JobCulture (fichier `data/offres-agent.json`) à chaque créneau, en retenant les offres des **8 dernières heures**. Au créneau 04:00, le système MUST collecter Indeed via JSearch (`country=fr`, `date_posted=today` ou équivalent, fenêtre **24 h**) et Apec via APEC API by API.SH sur RapidAPI (fenêtre **24 h**), sans scraping robot direct. Aux créneaux 12:00 et 20:00, le système MUST NOT appeler RapidAPI. Le run MUST fusionner les jeux d’offres avant export.

#### Scenario: Collecte Indeed via JSearch
- **WHEN** la partie JSearch du run s’exécute (créneau 04:00)
- **THEN** les appels ciblent Indeed avec `country=fr` et un filtre de date récente (~24 h)

#### Scenario: Autres sources via modèle Cursor
- **WHEN** le run d’agent Cursor s’exécute
- **THEN** les six sources non-API (hors Indeed / Apec) sont parcourues par le modèle sur une fenêtre de 8 h et persistées dans `offres-agent.json` avant fusion

#### Scenario: Apec via APEC API by API.SH
- **WHEN** `npm run veille` s’exécute avec une clé RapidAPI valide abonnée à APEC API by API.SH
- **THEN** le système interroge `/apec/v1/search` (fenêtre 24 h) et fusionne les offres retenues

#### Scenario: Créneau hors 04:00 sans RapidAPI
- **WHEN** `npm run veille:agent` (ou `--skip-rapidapi`) s’exécute
- **THEN** le système fusionne uniquement `offres-agent.json` et marque Indeed / Apec comme non interrogées

### Requirement: Résumé de fin de run
En fin de run, le système MUST résumer en français le nombre d’offres retenues, les 2–3 nouveautés les plus intéressantes, le lien vers le fichier Drive, et la confirmation d’envoi email (destinataires). S’il n’y a aucune offre, le système MUST le dire et lister les sources consultées.

#### Scenario: Run avec offres
- **WHEN** au moins une offre est retenue
- **THEN** le résumé indique le total, jusqu’à trois nouveautés intéressantes, et le lien Drive

#### Scenario: Run sans offre
- **WHEN** aucune offre n’est retenue
- **THEN** le résumé indique l’absence d’offres et liste les sources consultées
