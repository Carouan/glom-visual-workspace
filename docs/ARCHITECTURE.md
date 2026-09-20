# Architecture — V0.1

## 1. Objectif

G.L.O.M. Visual Workspace ne remplace pas le système de fichiers. Il lui ajoute une **couche de sens et de représentation**.

Trois couches sont séparées :

1. **Objets** — fichiers et dossiers réels ;
2. **Sens** — tags, notes, liens, ressources virtuelles ;
3. **Représentation** — position, zoom, relations et état visuel d'une vue.

~~~
              PWA
               │
      ┌────────┴────────┐
      │                 │
Système de fichiers   .glom/
      │                 │
  « objets »         « sens »
                        │
                  views/*.json
                        │
                 « représentation »
~~~

## 2. workspace.json

.glom/workspace.json contient l'identité du workspace, sa version de format et la vue par défaut.

Exemple conceptuel :

~~~json
{
  "format": "glom-workspace",
  "version": 1,
  "id": "uuid",
  "name": "Chef-d'œuvre — Les jeux vidéo",
  "defaultView": "views/main-mindmap.json"
}
~~~

Le champ version appartient au **format de données**, pas à la version de l'application.

## 3. resources.json

Une ressource décrit une chose pouvant apparaître dans une ou plusieurs vues.

Types V0.1 :

- root ;
- folder ;
- file ;
- virtual ;
- url.

Exemple :

~~~json
{
  "id": "r-abc123",
  "type": "file",
  "path": "Histoire/Tennis-for-Two.pdf",
  "title": "Tennis for Two",
  "tags": ["histoire", "1958", "oscilloscope"],
  "notes": "Source importante pour la ligne du temps."
}
~~~

Une ressource virtual n'a aucun fichier physique.

## 4. views/main-mindmap.json

La vue ne duplique pas la ressource. Elle ne stocke que sa représentation :

~~~json
{
  "format": "glom-view",
  "version": 1,
  "type": "mindmap",
  "pan": {"x": 40, "y": 40},
  "zoom": 0.9,
  "nodes": [
    {"id":"n-1","resourceId":"r-abc123","x":820,"y":260,"collapsed":false}
  ],
  "edges": [
    {"id":"m-1","from":"n-parent","to":"n-1","kind":"manual"}
  ]
}
~~~

Une même resourceId pourra donc être représentée dans plusieurs vues sans dupliquer le fichier physique.

## 5. Données locales au navigateur

Les handles du système de fichiers et permissions ne sont pas portables. Ils doivent rester dans IndexedDB ou dans le stockage local du navigateur, jamais dans .glom/.

Un second appareil relit .glom/ puis recrée sa propre autorisation d'accès au dossier.

## 6. Sécurité

Le dossier racine est choisi explicitement par l'utilisateur. La V0.1 :

- n'efface aucun fichier physique ;
- ne renomme aucun fichier physique ;
- ne déplace aucun fichier physique ;
- n'écrit que dans .glom/ lorsque le navigateur accorde l'accès en écriture.

## 7. Réversibilité

Test architectural :

> Si .glom/ est supprimé, les fichiers utilisateur restent lisibles, organisés et indépendants de G.L.O.M.

La perte concerne uniquement la couche ajoutée : positions, liens visuels, tags et annotations.

## 8. Extension vers d'autres vues

Le modèle est orienté **ressources**, pas « logiciel de mindmap ».

~~~
resources.json
     │
     ├── views/mindmap.json
     ├── views/kanban.json
     ├── views/timeline.json
     └── views/graph.json
~~~

C'est ce qui permettra de montrer les mêmes ressources de plusieurs manières sans les dupliquer.
