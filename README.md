# G.L.O.M. Visual Workspace

> Gratuit · Libre · Open-source · Multi-plateforme

G.L.O.M. Visual Workspace est un **workspace visuel local-first** : les vrais fichiers restent dans une arborescence normale, tandis que l'application stocke séparément leur représentation visuelle, les annotations, les tags, les styles et les relations.

**Version stable actuelle : v0.3.11.**

Démo / PWA publiée : https://carouan.github.io/glom-visual-workspace/

## Ce que fait déjà G.L.O.M.

### Workspace et fichiers

- PWA statique, sans build obligatoire ;
- ouverture d'un dossier via File System Access API lorsque le navigateur le permet ;
- mode de compatibilité par import de dossier sinon ;
- scan récursif avec progression non bloquante ;
- garde-fou actuel : 20 000 éléments et profondeur 48 ;
- explorateur de fichiers repliable ;
- déplacement physique de fichiers/dossiers par glisser-déposer après permission d'écriture ;
- déplacement hiérarchique depuis la mindmap avec mise à jour de l'arborescence ;
- création de dossiers depuis G.L.O.M. ;
- création locale de fichiers `.txt` et `.md` ;
- édition directe des fichiers texte et Markdown ;
- exclusions persistantes par chemin ou motif (`*.bak`, `nppBackup/**`, etc.) sans supprimer les fichiers ;
- workspaces récents via IndexedDB ;
- création d'un workspace vide puis matérialisation en vraie arborescence locale ;
- export d'un template ZIP contenant la structure et `.glom/`.

### Mindmap et whiteboard

- plusieurs mindmaps nommées par workspace, avec création, duplication, renommage et bascule ;
- mindmap générée depuis l'arborescence ;
- canvas libre, non borné par le format A4 ;
- déplacement, zoom, pan, recentrage et repli de branches ;
- nœuds redimensionnables ;
- styles de nœud : police, taille, graisse, italique, alignement, couleurs, bordure et forme ;
- icône/emoji personnalisé et aperçu d'une image dans un nœud ;
- verrouillage de position ;
- copier / coller / réinitialiser un style ;
- déplacement d'une branche comme groupe en conservant les positions relatives ;
- cadres de branche avec titre, fond, opacité, bordure et typographie ;
- objets graphiques libres : rectangle, ellipse, losange, annotation texte et image référencée depuis le workspace ;
- nœuds conceptuels indépendants des fichiers ;
- liens web et relations visuelles manuelles ;
- relations sélectionnables directement sur la carte, nommées et stylables : couleur, épaisseur, trait, flèches et courbure ;
- connecteurs adaptatifs : gauche/droite ou haut/bas selon la géométrie réelle des nœuds ;
- auto-layout de base en respectant les nœuds verrouillés ;
- panneaux Ressources et Détails rabattables indépendamment.

### Consultation et export

- viewer local modulaire : images, PDF, audio, vidéo, texte/code, Markdown rendu, JSON, CSV/TSV, DOCX, tableurs et ZIP ;
- galerie de contenu pour les dossiers ;
- aperçu Markdown + source + édition ;
- export de la carte en SVG et PNG ;
- impression / PDF A4 portrait ou paysage ;
- calcul du rendu à partir des limites réelles du contenu, sans limiter le canvas à une page ;
- export JSON portable lorsque l'écriture directe n'est pas possible ;
- cache PWA hors ligne du cœur de l'application.

## Principe d'architecture

~~~text
Mon-workspace/
├── Histoire/
├── Game-design/
├── Mon-jeu/
├── Sources/
└── .glom/
    ├── workspace.json
    ├── resources.json
    └── views/
        ├── main-mindmap.json
        ├── mindmap-….json
        └── mindmap-….json
~~~

Les documents restent des fichiers ordinaires. `.glom/` contient uniquement la couche G.L.O.M. : métadonnées et vues.

**Invariant principal : supprimer `.glom/` ne doit jamais supprimer ni rendre inutilisables les fichiers utilisateur.**

Les chemins stockés dans G.L.O.M. sont relatifs au workspace. Les permissions propres au navigateur restent locales au navigateur et ne sont pas écrites dans `.glom/`.

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour le modèle de données et [docs/ROADMAP.md](docs/ROADMAP.md) pour la suite.

## Tester localement

Aucun build n'est nécessaire. Il suffit de servir le dépôt en HTTP/HTTPS.

~~~bash
python -m http.server 8080
~~~

Puis ouvrir :

~~~text
http://localhost:8080
~~~

Démo directe :

~~~text
http://localhost:8080/?demo=1
~~~

## Déploiement GitHub Pages

Le workflow `.github/workflows/pages.yml` publie automatiquement `main`.

Dans **Settings → Pages**, la source doit être **GitHub Actions**.

## Compatibilité

Deux modes existent :

1. **Accès direct** : si `showDirectoryPicker()` est disponible, G.L.O.M. lit le dossier et peut écrire les fichiers locaux et `.glom/` après permission explicite.
2. **Mode compatibilité** : sinon, l'utilisateur importe un dossier via le sélecteur du navigateur. Les opérations nécessitant une écriture locale sont alors désactivées ou remplacées par un export.

La compatibilité est détectée à l'exécution : G.L.O.M. ne suppose pas qu'une plateforme expose toujours les mêmes API.

## Limites connues

- un fichier renommé ou déplacé **hors de G.L.O.M.** peut perdre son association avec ses métadonnées ;
- une même ressource ne peut pas encore avoir plusieurs occurrences visuelles distinctes **dans une même carte** ;
- pas encore de sélection multiple ;
- les images libres peuvent référencer une image existante du workspace ; l’import d’une image propre à la vue (`.glom/attachments/`) n’est pas encore implémenté ;
- pas encore de fusion multi-utilisateur ni de résolution de conflits ;
- les très gros workspaces sont scannés jusqu'au garde-fou actuel, mais l'indexation et le rendu progressifs restent prévus pour V0.5.

## Roadmap

La roadmap détaillée est dans [docs/ROADMAP.md](docs/ROADMAP.md) et les tâches restantes sont suivies dans les issues GitHub.

Priorités après v0.3.11 :

- terminer le mindmapping avancé : plusieurs occurrences d'une ressource dans une carte, sélection multiple, cadres/groupes avancés, images propres à la vue et layouts supplémentaires ;
- enrichir les métadonnées et vues (Kanban, timeline, graphe) en V0.4 ;
- améliorer la robustesse et retrouver les fichiers déplacés/renommés en V0.5 ;
- préparer synchronisation et résolution de conflits en V0.6.

## Dépendances viewer chargées à la demande

Les viewers Office utilisent des bibliothèques libres chargées lorsqu'un format en a besoin :

- Mammoth — DOCX — BSD-2-Clause ;
- @keep-lts/xlsx — tableurs — Apache-2.0 ;
- fflate — ZIP — MIT.

Le cœur de l'application reste statique et les fichiers utilisateur ne sont pas envoyés à un service distant. La vendorisation de ces dépendances reste prévue pour renforcer le fonctionnement hors ligne.

## Licence

MIT — voir [LICENSE](LICENSE).
