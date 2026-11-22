# Spec Delta

## Purpose

Gère la mémoire jour après jour : comparer à la veille précédente, signaler les nouveautés, puis enregistrer la liste du jour pour le run suivant.

## ADDED Requirements

### Requirement: Lecture de la veille précédente
Au début du traitement post-collecte, le système MUST lire la liste des offres du jour précédent lorsqu’elle existe.

#### Scenario: Premier run sans historique
- **WHEN** aucune liste du jour précédent n’existe
- **THEN** toutes les offres retenues sont traitées comme nouvelles et le run continue sans erreur

#### Scenario: Historique présent
- **WHEN** une liste du jour précédent est disponible
- **THEN** le système l’utilise pour identifier les nouveautés

### Requirement: Signalement des nouveautés
Le système MUST signaler les offres absentes de la liste du jour précédent (nouvelles par rapport à J−1).

#### Scenario: Nouvelle offre détectée
- **WHEN** une offre retenue aujourd’hui n’apparaît pas dans la liste de J−1
- **THEN** elle est marquée comme nouveauté dans le résumé et/ou les métadonnées du run

#### Scenario: Offre déjà vue
- **WHEN** une offre retenue aujourd’hui était déjà présente en J−1
- **THEN** elle n’est pas présentée comme nouveauté

### Requirement: Persistance de la liste du jour
À la fin d’un run réussi, le système MUST enregistrer la liste des offres du jour pour comparaison lors du prochain run.

#### Scenario: Enregistrement après succès
- **WHEN** le run a produit sa liste d’offres retenues
- **THEN** cette liste est persistée comme référence « jour courant » pour le run suivant
