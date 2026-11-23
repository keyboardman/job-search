# Design

## Context

Voir `proposal.md` — Why. Aujourd’hui le pipeline écrit des Excel (`src/excel.ts`) déposés dans Drive (`config/drive.json`, `docs/drive-upload.md`). Le dépôt n’expose pas encore ces offres en pages web. ExcelJS est déjà une dépendance ; la dédup existante (`src/dedupe.ts`) fusionne sur société + intitulé + localisation/remote.

Contrainte forte : la source des pages = **uniquement** les `.xlsx` Drive, pas les JSON locaux ni le run en cours.

## Goals / Non-Goals

**Goals:**
- Lire tous les `.xlsx` du dossier Drive « Veille emploi graphiste-DA », parser l’onglet Offres, agréger/dédupliquer, générer une page liste + une page par offre dans le dépôt.
- Rendre le site consultable via GitHub Pages depuis une racine dédiée du repo.
- Fournir un script npm reproductible (et un mode local sur un dossier de cache Excel pour les tests).

**Non-Goals:**
- Modifier le format Excel, l’upload Drive, ou l’email Gmail.
- Réécrire le pipeline de collecte / filtres / mémoire.
- Authentification ou pages privées ; le site est public comme le dépôt.
- UI complexe (filtres interactifs, recherche live) — HTML statique simple suffit.

## Decisions

### 1. Sortie : `site/` + GitHub Pages (dossier `/site`)
- Générer `site/index.html` (récapitulatif) et `site/offres/<slug>.html` (détail).
- Configurer GitHub Pages sur le dossier `/site` (ou `docs/` si le repo préfère déjà Pages depuis `docs/` — ici `docs/` contient déjà des procédures MCP, donc **`site/`** évite le mélange).
- Alternative rejetée : Markdown seuls dans le README — pas de page détail propre ni de Pages natif.

### 2. Acquisition Drive : MCP + cache local
- Flux nominal (agent / automation) : MCP Google Drive → lister le dossier `folderId` de `config/drive.json` → télécharger uniquement les fichiers dont le nom se termine par `.xlsx` (idéalement préfixe `Veille graphiste-DA`) vers un cache local `data/drive-xlsx/` (gitignoré).
- Script de génération (`npm run pages:build`) lit **uniquement** ce cache (ou un chemin passé en CLI) ; il ne lit pas `data/offres-*.json`.
- Alternative rejetée : Google Drive API Node dans le repo — alourdit auth/credentials alors que le MCP est déjà le canal Drive du projet.

### 3. Parse Excel : miroir de l’onglet Offres
- Nouveau module `src/pages/read-workbook.ts` (ExcelJS) : lit l’onglet « Offres », mappe les colonnes existantes (Société, Intitulé, Descriptif, Localisation, Télétravail, Langues, Date, Sources, Lien, Nouveau) vers une structure proche de `JobOffer`.
- Ignore l’onglet « Sources consultées » pour les pages offres (hors scope détail offre).
- Dédup : réutiliser `dedupeOffers` après normalisation minimale (sources split sur `, `, remote typé, `isNew` depuis oui/non).

### 4. Identifiants de page
- Slug stable : hash court ou slug dérivé de la clé de dédup (`company|title|loc`) pour le nom de fichier.
- Lien récap → détail relatifs (`./offres/<slug>.html`) pour fonctionner en Pages et en preview fichier.

### 5. Contenu HTML minimal, français
- Templates HTML statiques légers (pas de framework) : liste + fiche, CSS unique `site/assets/style.css`.
- Textes UI en français (aligné `veille-offres`).

### 6. Intégration au workflow
- Nouveau script `npm run pages:build` (et éventuellement `pages:build -- --input data/drive-xlsx`).
- Doc `docs/pages-github.md` : étapes MCP download → build → commit des fichiers sous `site/`.
- Ne pas brancher automatiquement dans `npm run veille` pour cette itération (évite de coupler collecte et publication GitHub) ; éventuellement un rappel dans le résumé / schedule plus tard.

## Risks / Trade-offs

- [MCP Drive ne télécharge pas le binaire xlsx] → Mitigation : documenter export Drive / fallback `download_file` ; en local, placer manuellement les xlsx dans `data/drive-xlsx/` pour valider le build.
- [Volume d’Excel historiques] → Mitigation : lire tous les xlsx du dossier ; si trop lent plus tard, filtrer par motif de date — hors scope initial.
- [Doublons imparfaits entre runs] → Mitigation : même clé que `dedupeOffers` ; conserver la version la plus complète (descriptif / date renseignés).
- [Pages publiques = offres exposées] → Accepté : même contenu déjà dans Drive / emails ; dépôt privé possible côté GitHub.

## Migration Plan

1. Ajouter modules + script + gitignore du cache Drive.
2. Peupler le cache une fois via MCP, lancer `pages:build`, committer `site/`.
3. Activer GitHub Pages sur `/site`.
4. Rollback : supprimer `site/` et désactiver Pages ; le reste du pipeline inchangé.

## Open Questions

- Fréquence de régénération (manuelle vs après chaque veille) — non bloquant pour l’implémentation ; documenter le flux manuel d’abord.
