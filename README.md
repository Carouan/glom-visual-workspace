# G.L.O.M. Visual Workspace

> Gratuit · Libre · Open-source · Multi-plateforme

G.L.O.M. Visual Workspace est un prototype de **workspace visuel local-first** : vos vrais fichiers restent dans une arborescence normale, tandis que l'application stocke séparément leur représentation visuelle, les annotations, les tags et les liens.

La V0.3 transforme le prototype en **workspace visuel réellement éditable** : explorateur de fichiers, consultation locale des ressources et mindmap stylable restent synchronisés sans enfermer les documents. La V0.3.2 ajoute aussi la construction d’un workspace depuis zéro et la synchronisation de la hiérarchie depuis la carte centrale.

## Fonctionnalités V0.3

- PWA statique et installable lorsque le navigateur le permet ;
- ouverture d'un dossier via File System Access API sur les navigateurs compatibles ;
- mode de compatibilité par import de dossier lorsque l'accès direct n'est pas disponible ;
- scan récursif des fichiers et dossiers ;
- mindmap générée automatiquement depuis l'arborescence ;
- déplacement libre des nœuds, zoom, pan, recentrage et repli des branches ;
- explorateur de fichiers repliable avec glisser-déposer physique lorsque l'écriture est autorisée ;
- glisser-déposer d’un nœud fichier/dossier sur un dossier directement dans la mindmap pour modifier l’arborescence ;
- création d’un workspace vide et ajout visuel de dossiers ;
- export d’un template ZIP contenant l’arborescence et `.glom/` ;
- matérialisation d’un workspace brouillon/démo dans un dossier local ;
- workspaces récents via IndexedDB ;
- export de la mindmap en SVG/PNG A4 et impression/PDF ;
- nœuds conceptuels indépendants des fichiers ;
- liens web et relations visuelles manuelles ;
- tags et notes ;
- styles par nœud : police, taille, graisse, italique, alignement, couleurs, bordure et forme ;
- icône/emoji personnalisé et aperçu des ressources image dans les nœuds ;
- verrouillage d'un nœud, copier/coller/réinitialiser un style ;
- cadres colorés autour d'une branche avec titre, fond et opacité ;
- réorganisation automatique de la carte en respectant les nœuds verrouillés ;
- viewer local modulaire : images, PDF, audio, vidéo, texte/code, Markdown rendu, JSON structuré, CSV/TSV, DOCX, tableurs et ZIP ;
- galerie de contenu pour les dossiers ;
- persistance dans .glom/ lorsque l'écriture est autorisée ;
- export JSON portable sinon ;
- cache PWA hors ligne de l'application ;

## Principe d'architecture

~~~
Mon-workspace/
├── Histoire/
├── Game-design/
├── Mon-jeu/
├── Sources/
└── .glom/
    ├── workspace.json
    ├── resources.json
    └── views/
        └── main-mindmap.json
~~~

Les documents restent des fichiers ordinaires. Le dossier .glom/ ne contient que les métadonnées et les vues.

**Règle structurante : supprimer .glom/ ne doit jamais supprimer ni rendre inutilisables les vrais fichiers.**

Voir docs/ARCHITECTURE.md pour le modèle de données.

## Tester localement

Aucun build n'est nécessaire. Servez simplement le dossier via HTTP ou HTTPS.

Avec Python :

~~~bash
python -m http.server 8080
~~~

Puis ouvrez http://localhost:8080

Vous pouvez aussi charger directement la démo avec :

~~~
http://localhost:8080/?demo=1
~~~

## Déploiement GitHub Pages

Le workflow .github/workflows/pages.yml publie automatiquement le dépôt lors d'un push sur main.

Dans Settings → Pages, utilisez **GitHub Actions** comme source si GitHub ne l'active pas automatiquement au premier déploiement.

## Compatibilité

Deux modes sont prévus :

1. **Accès direct** : si showDirectoryPicker() est disponible, la PWA lit le dossier et peut écrire .glom/ après permission explicite.
2. **Mode compatibilité** : sinon, l'utilisateur importe un dossier via le sélecteur du navigateur. Les vues sont alors exportées manuellement en JSON.

La compatibilité est détectée à l'exécution. La V0.1 ne suppose donc pas qu'une plateforme donnée expose systématiquement les mêmes API.

## Limites connues

- un renommage ou déplacement effectué hors de l'application peut casser l'association avec les annotations ;
- pas encore de fusion multi-utilisateur ni de résolution de conflits ;
- une seule vue mindmap pour le moment ;
- le scan est limité volontairement pour éviter qu'un dossier énorme bloque l'interface.

## Roadmap

La roadmap détaillée est maintenue dans [docs/ROADMAP.md](docs/ROADMAP.md) et dans les issues GitHub.

Axes principaux :

- V0.2.x : enrichir le viewer, miniatures et nouveaux formats ;
- V0.3.x : compléter le mindmapping avancé — cartes multiples, relations stylables, objets libres, sélection multiple et layouts supplémentaires ;
- V0.4 : métadonnées avancées, Kanban, timeline et graphe ;
- V0.5 : robustesse et suivi des fichiers déplacés/renommés ;
- V0.6 : synchronisation et gestion des conflits ;
- plus tard : plugins, scripts, templates et API d'extensions.

## Licence

MIT — voir LICENSE.


## Dépendances viewer chargées à la demande

Les viewers Office utilisent des bibliothèques libres chargées uniquement lorsqu'un format en a besoin : Mammoth (DOCX, BSD-2-Clause), @keep-lts/xlsx (tableurs, Apache-2.0) et fflate (ZIP, MIT). Le cœur de l'application reste statique et les fichiers utilisateur ne sont pas envoyés à un service distant. Une étape V0.2.x prévoit de vendoriser ces dépendances pour un fonctionnement hors-ligne complet.
