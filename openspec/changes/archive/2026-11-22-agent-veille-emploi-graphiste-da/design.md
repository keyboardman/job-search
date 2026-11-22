# Design

## Context

Dépôt greenfield (OpenSpec seul). Voir `proposal.md` pour le pourquoi. Contraintes fortes : sites anti-bots (Indeed), livrable Excel daté sur Google Drive, brief versionné, run quotidien 08:00 Europe/Paris, contenu FR. MCP Google Drive authentifié dans la session de planification.

## Goals / Non-Goals

**Goals:**

- Orchestrer un run déterministe : charger le prompt → collecter via JSearch → filtrer/dédupliquer → comparer J−1 → Excel → Drive → résumé.
- Rendre le brief éditable sans toucher au code (`prompts/…`).
- Isoler secrets (clé RapidAPI/JSearch, auth Drive) hors du dépôt.

**Non-Goals:**

- Candidature automatique ou rédaction de lettres.
- Scraping direct des sites bloquants (Indeed, etc.).
- UI web de consultation (Drive + résumé chat suffisent).
- Couverture hors France / hors postes graphiste-DA.

## Decisions

### 1. Fichier prompt versionné

- **Choix** : `prompts/veille-emploi-graphiste-da.md` contient le brief complet (objectif, sources, localisation, champs, export, mémoire, fin). L’agent le lit en premier à chaque run.
- **Pourquoi** : le brief évolue plus souvent que le runtime ; un fichier dédié évite de disperser les règles dans plusieurs docs.
- **Alternative** : prompt inline dans une Automation Cursor uniquement — rejeté car non versionné clairement dans le dépôt.

### 2. Runtime = Automation Cursor planifiée + outils MCP

- **Choix** : déclencheur quotidien 08:00 Europe/Paris (Automation Cursor ou équivalent agent planifié) avec accès MCP Google Drive et appels HTTP JSearch (clé RapidAPI en secret d’environnement / Automation).
- **Pourquoi** : aligne « agent » + dépôt Drive + planning matin ; pas besoin d’infra serveur dédiée au départ.
- **Alternative** : cron local + script Node/Python — possible en secours si l’Automation n’est pas disponible.

### 3. Collecte hybride : modèle Cursor + JSearch (Indeed)

- **Choix** : le **modèle Cursor** parcourt Welcome to the Jungle, LinkedIn Emplois, France Travail, Hellowork, Apec, ProfilCulture, JobCulture et écrit `data/offres-agent.json`. **JSearch** (`GET …/search-v2`, `country=fr`, `date_posted=today`, queries `… via Indeed`) ne couvre que **Indeed** (anti-bots). `npm run veille` fusionne les deux, filtre, déduplique, Excel, mémoire, résumé.
- **Pourquoi** : JSearch évite les blocages Indeed ; les autres sites sont mieux couverts par un agent Cursor que par Google for Jobs.
- **Alternative** : tout passer par JSearch — rejeté : couverture faible hors Indeed / LinkedIn.

### 4. Modèle d’offre et déduplication

- **Choix** : structure canonique `{ company, title, summary, location, remote, languages, date, sources[], urls[] }`. Clé de dédup : normalisation société + intitulé + (ville ou remote) ; fusion des `sources`/`urls` si collision.
- **Pourquoi** : une ligne Excel = une offre réelle multi-postée.
- **Alternative** : dédup uniquement par URL — insuffisant car multi-sites.

### 5. Mémoire J−1

- **Choix** : fichier `data/offres-veille.json` (liste du dernier run réussi : id dérivé + champs clés). Au run N : lire → marquer `isNew` → écrire la nouvelle liste en fin de succès.
- **Pourquoi** : simple, versionnable ou au minimum persisté localement/cloud selon le runtime ; pas de base SQL.
- **Alternative** : dériver J−1 depuis le dernier Excel Drive — plus lent et fragile si export échoue.

### 6. Excel puis dépôt Drive

- **Choix** : générer un vrai `.xlsx` (onglets `Offres` et `Sources consultées`, hyperliens, auto-filtre, tri date desc). Déposer dans le dossier Drive « Veille emploi graphiste-DA » (rechercher le dossier ; le créer s’il manque — sous réserve du grant `drive.file`). Nom : `Veille graphiste-DA AAAA-MM-JJ.xlsx`.
- **Pourquoi** : le besoin exige Excel + filtres + liens, pas seulement un Sheet.
- **Fallback** : si l’upload binaire n’est pas supporté par le MCP, créer un Google Sheet équivalent via `create_file` (CSV/markdown → spreadsheet) puis `export_file` en `xlsx` et placer le binaire exporté / le Sheet dans le dossier ; le résumé pointe vers le lien Drive obtenu.
- **Alternative** : uniquement Google Sheet — rejeté comme format principal car l’utilisateur a demandé Excel.

### 7. Résumé de fin

- **Choix** : message FR court : total retenues, 2–3 nouveautés (prioriser DA / remote / fit profil), lien Drive ; si zéro offre → dire clairement + lister sources + remarques illisibles.
- **Pourquoi** : livrable de lecture rapide sans ouvrir le fichier.

## Risks / Trade-offs

- [JSearch quota / coût RapidAPI] → Plafonner `num_pages` et le nombre de queries ; logger les crédits ; alerter dans le résumé si quota / erreur API.
- [Couverture inégale Google for Jobs] → ProfilCulture / JobCulture / France Travail peuvent être peu ou pas indexés ; les lister à 0 avec remarque explicite plutôt que forger des résultats.
- [Grant Drive `drive.file` : dossier existant non créé par l’app] → Créer le dossier via MCP au premier run, ou demander à l’utilisateur de le sélectionner / partager avec l’app.
- [LinkedIn souvent hostile aux scrapers] → Timeout court, retry fin de run, marquer illisible sans inventer.
- [Faux positifs postes (stage mal tagué)] → Heuristiques titre + type de contrat ; en doute et signal stage/alternance → exclure.
- [Dédup imparfaite] → Préférer fusionner trop (1 ligne) plutôt que doubler ; revue manuelle via Excel.
- [Automation hors Paris TZ] → Fixer explicitement `Europe/Paris` dans la config du trigger.

## Migration Plan

1. Créer arborescence `prompts/`, `data/`, config secrets RapidAPI/JSearch.
2. Authentifier / vérifier MCP Google Drive ; créer ou résoudre le dossier cible.
3. Dry-run manuel (1 source puis 8) avant d’activer le schedule 8 h.
4. Rollback : désactiver le trigger ; les Excel déjà déposés restent sur Drive ; `data/offres-veille.json` peut être réinitialisé.

## Open Questions

- Emplacement exact du dossier Drive (racine My Drive vs sous-dossier existant) si plusieurs homonymes.
- Plan RapidAPI JSearch (BASIC vs payant) et jeu exact de `query` / publishers à figer au premier apply.
- Surface de planification définitive (Cursor Automation vs cron) selon disponibilité de l’éditeur Automations au moment de l’implémentation.
