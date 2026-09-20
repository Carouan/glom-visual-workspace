# UI V0.3.3 — Menus, palette et actions contextuelles

## Principe de répartition

L'interface suit désormais quatre zones fonctionnelles stables :

| Zone | Rôle |
| --- | --- |
| Barre supérieure | Actions globales du workspace et de l'application |
| Barre latérale gauche | Navigation dans l'arborescence réelle/logique |
| Vue centrale | Construction et manipulation visuelle de la mindmap |
| Barre latérale droite | Propriétés et actions de la sélection |

L'objectif est d'éviter que chaque nouvelle fonctionnalité ajoute un bouton permanent dans la barre supérieure.

## Barre supérieure

Le bouton **Ouvrir** reste visible car il s'agit de l'action d'entrée principale.

Les autres actions sont regroupées :

### Workspace
- Nouveau workspace
- Workspaces récents
- Charger la démo
- Rescanner le dossier
- Enregistrer / exporter les vues

### Insertion
- Nouveau dossier
- Nouvelle idée
- Lien web

### Vue
- Recentrer / ajuster
- Réorganiser la carte

### Exporter
- Exports et impression
- le dialogue d'export regroupe SVG, PNG, impression/PDF, template ZIP et matérialisation sur disque

## Palette de la mindmap

La palette flottante est réservée aux opérations effectuées **sur la carte**.

Outils actifs en V0.3.3 :

- Sélection / déplacement
- Dossier
- Idée
- Relation
- Cadre de branche

Emplacements réservés mais désactivés tant qu'ils ne sont pas implémentés :

- Forme libre
- Texte / annotation
- Image libre

Un outil désactivé doit toujours indiquer clairement qu'il est prévu pour une version ultérieure ; il ne doit jamais simuler une fonctionnalité inexistante.

## Actions contextuelles

Lorsqu'un nœud est sélectionné, la barre de droite expose des raccourcis adaptés :

- Dossier enfant, uniquement pour un workspace/dossier ;
- Idée liée ;
- Relation ;
- Cadre de branche si la sélection possède une branche ou un cadre existant.

Ces raccourcis complètent la palette : ils ne modifient pas la séparation entre ressource, hiérarchie physique et représentation visuelle.

## Règle pour les futures fonctionnalités

Avant d'ajouter un bouton permanent, choisir sa destination selon la règle suivante :

1. agit sur le workspace entier → menu supérieur ;
2. crée/manipule un objet graphique → palette centrale ;
3. modifie l'objet sélectionné → inspecteur droit ;
4. navigue dans les fichiers/dossiers → barre gauche.

Cette règle doit permettre à l'interface de continuer à évoluer sans transformer la barre supérieure en ruban de commandes.
