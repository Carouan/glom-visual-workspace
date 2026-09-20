# G.L.O.M. Visual Workspace

> Gratuit · Libre · Open-source · Multi-plateforme

G.L.O.M. Visual Workspace est un prototype de **workspace visuel local-first** : vos vrais fichiers restent dans une arborescence normale, tandis que l'application stocke séparément leur représentation visuelle, les annotations, les tags et les liens.

La V0.1 valide un besoin simple : **ouvrir un dossier, le voir comme une carte mentale, annoter ses ressources et cliquer sur un nœud pour retrouver le fichier correspondant**.

## Fonctionnalités V0.1

- PWA statique et installable lorsque le navigateur le permet ;
- ouverture d'un dossier via File System Access API sur les navigateurs compatibles ;
- mode de compatibilité par import de dossier lorsque l'accès direct n'est pas disponible ;
- scan récursif des fichiers et dossiers ;
- mindmap générée automatiquement depuis l'arborescence ;
- déplacement libre des nœuds, zoom, pan, recentrage et repli des branches ;
- nœuds conceptuels indépendants des fichiers ;
- liens web et relations visuelles manuelles ;
- tags et notes ;
- prévisualisation locale des images, PDF, audio, vidéo et fichiers texte courants ;
- persistance dans .glom/ lorsque l'écriture est autorisée ;
- export JSON portable sinon ;
- cache PWA hors ligne de l'application ;
- aucune dépendance JavaScript externe dans la V0.1.

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
- pas de renommage ou déplacement physique des fichiers depuis l'application ;
- une seule vue mindmap dans cette première version ;
- le scan est limité volontairement pour éviter qu'un dossier énorme bloque l'interface.

## Roadmap

- V0.2 : retrouver un fichier déplacé via empreinte légère ;
- V0.2 : plusieurs vues mindmap ;
- V0.3 : vues Kanban, timeline et graphe sur les mêmes ressources ;
- V0.3 : statut, date, priorité et filtres avancés ;
- V0.4 : synchronisation et gestion des conflits ;
- plus tard : plugins/scripts, templates et API d'extensions.

## Licence

MIT — voir LICENSE.
