# Roadmap — G.L.O.M. Visual Workspace

> Gratuit · Libre · Open-source · Multi-plateforme

Cette roadmap décrit l'évolution visée après la V0.1. Le principe reste inchangé : **les fichiers réels restent la source de vérité** ; G.L.O.M. ajoute une couche de métadonnées, de visualisation et de navigation dans `.glom/`.

## V0.2 — Universal Resource Viewer

Objectif : permettre de **consulter immédiatement une ressource sans quitter le workspace**.

### Inclus dans la première V0.2

- galerie de contenu pour un dossier ;
- images : aperçu et zoom ;
- PDF : viewer intégré du navigateur ;
- Markdown : rendu + vue source ;
- texte/code/logs : aperçu avec numéros de lignes et recherche ;
- JSON : vue structurée repliable ;
- CSV/TSV : tableau ;
- DOCX : conversion locale en HTML avec Mammoth ;
- XLS/XLSX/XLSM/XLSB/ODS : lecture locale des feuilles sous forme de tableaux ;
- audio et vidéo : lecteurs natifs ;
- ZIP : liste des fichiers contenus dans l'archive ;
- fallback propre pour les formats non pris en charge.

Les modules externes nécessaires aux formats Office sont libres et chargés à la demande. Une étape ultérieure devra permettre de les **vendoriser dans l'application** pour garantir un fonctionnement hors-ligne complet.

### À compléter en V0.2.x

- miniatures de vraies ressources dans les galeries ;
- navigation précédent/suivant dans un dossier ;
- recherche dans PDF ;
- viewer EPUB ;
- viewer 3D STL/OBJ/GLTF ;
- aperçu des présentations PPTX/ODP ;
- cache local des miniatures ;
- ouverture explicite dans l'application système quand l'API navigateur le permet.

## V0.2.1 — Explorateur de fichiers et navigation de workspace

Objectif : faire de la barre latérale gauche un **véritable navigateur de fichiers**, tout en conservant la mindmap comme représentation parallèle.

- arborescence repliable/dépliable dossier par dossier ;
- glisser-déposer de fichiers et dossiers vers un autre dossier ;
- déplacement physique uniquement après permission explicite d'écriture ;
- protection contre les déplacements invalides (dans soi-même, collision de nom, dossier protégé) ;
- mise à jour **incrémentale** du modèle après déplacement : seuls les chemins, le lien hiérarchique et les branches concernées sont recalculés ;
- pas de rescan complet après une opération locale connue ;
- taille du fichier sélectionné dans le panneau Détails ;
- taille agrégée des dossiers calculée à partir des métadonnées déjà indexées ;
- date de dernière modification lorsque disponible ;
- séparation stricte entre déplacement physique du fichier et disposition visuelle des nœuds de la mindmap.

## V0.2.2 — Export, impression et workspaces récents

### Export de la mindmap

- export SVG ;
- export PNG ;
- mise en page imprimable A4 paysage/portrait ;
- commande « Imprimer / PDF » utilisant le moteur d'impression du navigateur ;
- ajustement automatique de l'échelle et marges ;
- option d'inclure ou non les nœuds masqués/repliés.

### Workspaces récents

- registre local des workspaces déjà ouverts ;
- conservation des `FileSystemDirectoryHandle` dans IndexedDB lorsque le navigateur l'autorise ;
- menu « Workspaces récents » ;
- réouverture et bascule rapide d'un workspace à l'autre ;
- renouvellement explicite de la permission si le navigateur l'exige ;
- possibilité d'oublier un workspace récent sans toucher au dossier lui-même.

### Accès distant — étude

Un accès SSH/SFTP direct n'est **pas une capacité standard d'une PWA** : le navigateur n'expose pas de socket TCP brut permettant d'ouvrir une session SSH.

Pistes à étudier séparément :

- adaptateur WebDAV/Nextcloud ;
- adaptateur Git ;
- passerelle locale ou serveur léger exposant un workspace distant via HTTPS/WebSocket ;
- éventuellement SFTP derrière cette passerelle.

L'objectif est de conserver la même abstraction « workspace » sans coupler le cœur de G.L.O.M. à SSH.

## V0.3 — Mindmap avancée

Objectif : faire de la carte mentale une vraie surface d'édition, pas seulement une projection de l'arborescence.

### V0.3.0 — première couche d'édition visuelle

- taille du texte d'un nœud ;
- famille de police, graisse, italique et alignement ;
- couleur du texte ;
- couleur de fond et de bordure ;
- épaisseur de bordure ;
- formes rectangle / arrondie / capsule ;
- icône ou emoji personnalisé par nœud ;
- aperçu d'une ressource image directement dans son nœud ;
- verrouillage de la position d'un nœud ;
- copier / coller / réinitialiser un style ;
- cadre coloré automatique autour d'une branche, avec titre, fond, opacité et bordure ;
- réorganisation automatique de la carte en conservant les nœuds verrouillés ;
- conservation des styles et cadres dans le JSON de vue ;
- export SVG/PNG/PDF tenant compte des styles et cadres.

Les choix visuels appartiennent à la **vue** et non à la ressource : un même fichier peut donc être affiché différemment dans deux cartes.

### V0.3.2 — construction visuelle du workspace

- glisser un fichier ou dossier **sur un dossier dans la mindmap** pour le reparent dans l'arborescence ;
- déplacement physique correspondant en mode File System Access ;
- reparentage purement logique dans les workspaces brouillon/démo ;
- mise à jour immédiate de la barre gauche sans rescan complet ;
- créer un workspace vide (« mindmap from scratch ») ;
- créer des dossiers comme enfants du dossier sélectionné ;
- exporter un **template ZIP** contenant l'arborescence de dossiers et `.glom/` ;
- matérialiser un workspace brouillon/démo dans un dossier local choisi ;
- conserver les ressources « fichier » sans contenu comme références planifiées/absentes tant qu'un vrai fichier n'existe pas.

Le template ZIP ne copie pas encore les contenus des vrais fichiers : il est destiné à transporter la **structure + la carte + les métadonnées**. Un export de sauvegarde complète avec contenus sera traité séparément.

### V0.3.3 — organisation de l'interface

- barre supérieure compacte organisée en menus Workspace / Insertion / Vue / Exporter ;
- bouton Ouvrir conservé comme action globale immédiatement visible ;
- palette flottante dédiée à la création/manipulation visuelle sur la mindmap ;
- outils de palette actifs : sélection, dossier, idée, relation et cadre de branche ;
- emplacements réservés pour formes, texte/annotation et image libre, désactivés tant que non implémentés ;
- actions contextuelles dans l'inspecteur pour la sélection courante ;
- fermeture automatique des menus après une action, clic extérieur ou Échap ;
- règle d'UX documentée dans `docs/UI-V0.3.3.md` pour éviter la prolifération future de boutons.

### V0.3.x — enrichissements suivants

- plusieurs cartes par workspace ;
- ajouter plusieurs fois une même ressource dans une carte ;
- images et médias comme objets libres, pas seulement dans un nœud de ressource ;
- relations nommées et stylables ;
- redimensionnement et verrouillage manuel des cadres/groupes ;
- sélection multiple ;
- déplacement d'une branche complète ;
- styles/thèmes réutilisables ;
- auto-layout horizontal, vertical et radial ;
- duplication rapide d'un style sur une branche entière.

## V0.4 — Métadonnées et vues multiples

- statut ;
- priorité ;
- dates ;
- favoris ;
- propriétés personnalisées ;
- filtres combinables ;
- galerie ;
- liste/tableau ;
- Kanban ;
- timeline ;
- graphe relationnel.

Toutes ces vues utilisent les mêmes `resources.json` sans dupliquer les fichiers.

## V0.5 — Portabilité et robustesse

- retrouver automatiquement un fichier renommé ou déplacé ;
- empreinte légère des ressources ;
- import/export complet d'un workspace ;
- migrations versionnées du format `.glom` ;
- sauvegardes et restauration ;
- diagnostic d'intégrité ;
- gros workspaces : indexation et chargement progressif.

## V0.6 — Collaboration et synchronisation

- stratégie de fusion de `.glom` ;
- historique des modifications ;
- détection et résolution de conflits ;
- synchronisation compatible avec des dossiers partagés ;
- édition à plusieurs utilisateurs lorsque l'infrastructure choisie le permet.

## Plus loin — plateforme d'extensions

- API de plugins ;
- viewers additionnels ;
- scripts ;
- templates ;
- automatisations ;
- vues personnalisées ;
- import/export vers d'autres formats ouverts.

## Invariants d'architecture

1. Supprimer `.glom/` ne doit jamais supprimer ou rendre inutilisables les fichiers utilisateur.
2. Les chemins internes restent relatifs au workspace.
3. Les métadonnées portables restent dans des formats ouverts et lisibles.
4. Les permissions et handles propres au navigateur ne sont jamais stockés dans `.glom/`.
5. Une ressource et sa représentation visuelle restent deux objets distincts.
