# Tasks

## 1. Base Notion et config

- [x] 1.1 Inspecter la base modèle « Suivi des candidatures » (connecté) et noter les types/options de Suivi, Plateforme(s), Relance RH via LinkedIn
- [x] 1.2 Créer la nouvelle base Notion « Veille emploi graphiste-DA » avec les propriétés du design (suivi + offre + Offer id) et vérifier que la vue liste affiche les colonnes attendues
- [x] 1.3 Créer une intégration Notion, partager la base, renseigner `config/notion.json` (databaseId, databaseUrl) et `NOTION_TOKEN` dans `.env` ; vérifier qu’un appel API `retrieve database` réussit

## 2. Client Notion et sync

- [x] 2.1 Extraire `parisDateString` / `parisScheduleSlot` hors de `excel.ts` (ex. `src/schedule.ts`) et vérifier que les imports email/run compilent
- [x] 2.2 Implémenter `src/notion/` (client + map offre → properties + upsert par Offer id avec merge anti-écrasement des champs suivi) et vérifier upsert create puis update sur une offre de test
- [x] 2.3 Brancher la sync dans `src/run.ts` après mémoire, retirer `writeWorkbook` / CSV Drive du chemin nominal, et vérifier qu’un `npm run veille -- --dry-run` (ou équivalent) synchronise sans écrire de `.xlsx`

## 3. Email highlights

- [x] 3.1 Adapter `src/mail.ts` / `src/summary.ts` : corps highlights (isNew puis date, max 5) + lien Notion, plus de pièce jointe Excel ; vérifier le texte généré en console
- [x] 3.2 Mettre à jour `docs/email-send.md` et vérifier que la doc décrit l’envoi MCP Gmail sans xlsx

## 4. Prompt, docs et retrait Drive/pages

- [x] 4.1 Mettre à jour `prompts/veille-emploi-graphiste-da.md` (Notion + email highlights ; plus Drive / Excel / pages GitHub) et vérifier la cohérence du déroulé de run
- [x] 4.2 Remplacer ou archiver `docs/drive-upload.md` et `docs/pages-github.md` (pointeurs vers Notion) ; déprécier `config/drive.json` ; vérifier qu’aucune doc active n’exige encore le dépôt Drive
- [x] 4.3 Retirer `pages:build` du flux opérationnel (scripts/prompt) ; optionnel : nettoyer `src/pages/*` / dépendance exceljs si plus utilisée — vérifier `npm run build` ou `tsc` OK

## 5. Intégration

- [x] 5.1 Exécuter un run de bout en bout (collecte ou fixture) : offres dans Notion, email préparé sans PJ, résumé avec lien Notion ; vérifier absence de nouveau `.xlsx` et pas de commit `site/` requis

## Workflow follow-up

- Archive le change OpenSpec après revue / apply réussis.
- Vérifier le résultat archivé (`openspec` specs principales à jour).
