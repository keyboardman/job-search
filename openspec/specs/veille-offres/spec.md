# veille-offres Specification

## Purpose

Définit le comportement de veille : quels postes et sources consulter, quels filtres appliquer, quels champs produire, et comment dédupliquer sans inventer d’information.

## Requirements

### Requirement: Contenu exclusivement en français
Le système MUST produire tout le contenu livré à l’utilisateur en français. Les offres rédigées en anglais MAY être lues et retenues, mais les champs descriptifs générés MUST être en français.

#### Scenario: Résumé et descriptifs en français
- **WHEN** une offre anglophone est retenue
- **THEN** le bref descriptif et tout texte produit par l’agent sont en français

### Requirement: Périmètre des postes
Le système MUST retenir uniquement les offres de graphiste (print, digital, PAO) et de directeur·rice artistique (junior, senior, direction artistique) publiées ou mises à jour au cours des dernières 24 heures en France et encore ouvertes. Le système MUST exclure stages, alternances, apprentissages et contrats de professionnalisation.

#### Scenario: Offre DA senior ouverte hier
- **WHEN** une offre « directeur artistique senior » ouverte a été publiée il y a moins de 24 heures en France
- **THEN** l’offre est retenue

#### Scenario: Stage exclu
- **WHEN** une offre de graphiste est marquée stage ou alternance
- **THEN** l’offre est rejetée

### Requirement: Sources obligatoires
À chaque run, le système MUST consulter : Welcome to the Jungle, Indeed, LinkedIn Emplois, France Travail, Hellowork, Apec, ProfilCulture, JobCulture. Le système MUST NOT inventer une offre, une date ou un détail. Si une info manque, le système MUST écrire « non précisé ».

#### Scenario: Source illisible
- **WHEN** une source reste illisible après nouvel essai en fin de run
- **THEN** la source est notée comme illisible et aucune offre n’est inventée pour la remplacer

#### Scenario: Source lente
- **WHEN** une source est trop lente
- **THEN** le système passe aux autres sources et y revient à la fin du run

### Requirement: Règles de localisation
Le télétravail complet MUST être accepté partout en France. Télétravail partiel, aucun ou non précisé MUST être limité à Île-de-France, Oise (60) ou Aisne (02).

#### Scenario: Full remote hors IDF
- **WHEN** une offre en télétravail complet est basée hors Île-de-France
- **THEN** l’offre est retenue

#### Scenario: Présentiel hors zone
- **WHEN** une offre sans télétravail est située à Lyon
- **THEN** l’offre est rejetée

### Requirement: Champs par offre
Chaque offre retenue MUST exposer : société, intitulé, bref descriptif (1–2 phrases), localisation, télétravail (complet / partiel / aucun / non précisé), langues demandées, date de publication ou de mise à jour, source(s), lien cliquable.

#### Scenario: Champ manquant
- **WHEN** les langues demandées ne figurent pas dans l’annonce
- **THEN** le champ langues vaut « non précisé »

### Requirement: Déduplication multi-sources
Une annonce publiée sur plusieurs sites MUST apparaître une seule fois, en listant toutes les sources.

#### Scenario: Même poste sur Indeed et WTTJ
- **WHEN** la même offre apparaît sur Indeed et Welcome to the Jungle
- **THEN** une seule ligne est produite avec les deux sources et les liens associés
