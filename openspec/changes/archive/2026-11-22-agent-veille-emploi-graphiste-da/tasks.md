# Tasks

## 1. Socle dépôt et prompt

- [x] 1.1 Créer `prompts/veille-emploi-graphiste-da.md` avec le brief complet (objectif, sources, localisation, champs, export, mémoire, fin) et vérifier que le fichier est lisible et entièrement en français
- [x] 1.2 Créer `data/` avec `offres-veille.json` initial (`[]` ou schéma documenté) et un `.gitignore` pour secrets locaux ; vérifier que le JSON parse
- [x] 1.3 Documenter dans `README.md` les prérequis (clé RapidAPI/JSearch, MCP Google Drive, fuseau Europe/Paris) et vérifier que les chemins du prompt et de la mémoire y figurent

## 2. Collecte JSearch et filtrage

- [x] 2.1 Configurer l’accès JSearch (secret RapidAPI + client HTTP `jsearch.p.rapidapi.com/search-v2`) et vérifier un appel réussi `country=fr` + query graphiste
- [x] 2.2 Implémenter le jeu de queries (titres, remote/IDF, variantes publisher) avec `date_posted=today`, pagination plafonnée, et logique timeout → suite → retry fin ; vérifier qu’un échec simulé est retenté puis noté
- [x] 2.3 Mapper `job_publisher` / URLs vers les 8 sources obligatoires et remplir « Sources consultées » (y compris 0 + remarque si non couverte) ; vérifier qu’Indeed/LinkedIn remontent correctement quand présents
- [x] 2.4 Implémenter filtres poste (graphiste/DA), 24 h, France, exclusion stage/alternance/INTERN, règles remote/IDF-60-02 ; vérifier avec fixtures d’offres acceptées et rejetées
- [x] 2.5 Implémenter la normalisation des champs (dont « non précisé ») et la déduplication multi-sources ; vérifier qu’une offre double Indeed+WTTJ ne produit qu’une ligne

## 3. Mémoire quotidienne

- [x] 3.1 Charger `data/offres-veille.json` en début de post-collecte et marquer les nouveautés vs J−1 ; vérifier le cas « premier run » (tout nouveau) et le cas « offre déjà vue »
- [x] 3.2 Persister la liste du jour uniquement après succès de collecte/filtre ; vérifier que le fichier mis à jour est relu correctement au run suivant (simulation)

## 4. Excel et Google Drive

- [x] 4.1 Générer le `.xlsx` `Veille graphiste-DA AAAA-MM-JJ.xlsx` (onglets Offres + Sources consultées, hyperliens, filtres, tri date desc) et vérifier ouverture locale + contenu des deux onglets
- [x] 4.2 Résoudre ou créer le dossier Drive « Veille emploi graphiste-DA » via MCP Google Drive et y déposer le fichier ; vérifier présence via `search` / `list_folder` et récupérer le lien
- [x] 4.3 Documenter le fallback Sheet→export xlsx si l’upload binaire échoue ; vérifier qu’un dry-run produit un livrable accessible dans le dossier cible

## 5. Orchestration, planning et résumé

- [x] 5.1 Brancher le run bout-en-bout : charger prompt → JSearch → filtrer → mémoire → Excel → Drive → résumé FR ; vérifier un dry-run manuel
- [x] 5.2 Configurer le déclenchement quotidien 08:00 Europe/Paris (Automation Cursor ou cron de secours) avec outils Drive + secret RapidAPI ; vérifier que la config affiche 8 h Paris
- [x] 5.3 Implémenter le résumé final (total, 2–3 nouveautés, lien Drive ; ou zéro offre + sources) et vérifier les deux scénarios avec jeux de données fictifs

## Workflow follow-up

- Archive le change OpenSpec après validation d’un run réel matinal.
- Confirmer le plan JSearch RapidAPI et l’emplacement définitif du dossier Drive s’il existe plusieurs homonymes.
