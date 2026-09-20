# Roadmap — G.L.O.M. Visual Workspace

> Gratuit · Libre · Open-source · Multi-plateforme

**État actuel : v0.3.10 stable.**

Cette roadmap distingue désormais ce qui est déjà livré de ce qui reste à construire. Le principe reste inchangé : **les fichiers réels restent la source de vérité** ; G.L.O.M. ajoute une couche de métadonnées, de visualisation et de navigation dans `.glom/`.

## V0.2 — Universal Resource Viewer ✅ livré

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

## V0.2.1 — Explorateur de fichiers et navigation de workspace ✅ livré

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

## V0.2.2 — Export, impression et workspaces récents ✅ livré

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

## V0.3 — Mindmap avancée 🚧 en cours

Objectif : faire de la carte mentale une vraie surface d'édition, pas seulement une projection de l'arborescence.

### V0.3.0 — première couche d'édition visuelle ✅

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

### V0.3.2 — construction visuelle du workspace ✅

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

### V0.3.3 — organisation de l'interface ✅

- barre supérieure compacte organisée en menus Workspace / Insertion / Vue / Exporter ;
- bouton Ouvrir conservé comme action globale immédiatement visible ;
- palette flottante dédiée à la création/manipulation visuelle sur la mindmap ;
- outils de palette actifs : sélection, dossier, idée, relation et cadre de branche ;
- emplacements réservés pour formes, texte/annotation et image libre, désactivés tant que non implémentés ;
- actions contextuelles dans l'inspecteur pour la sélection courante ;
- fermeture automatique des menus après une action, clic extérieur ou Échap ;
- règle d'UX documentée dans `docs/UI-V0.3.3.md` pour éviter la prolifération future de boutons.

### V0.3.5 — espace de travail et objets graphiques libres ✅

- panneaux **Ressources** et **Détails** rabattables indépendamment sur desktop ;
- boutons latéraux pour rouvrir un panneau masqué ;
- commandes équivalentes dans le menu **Vue** ;
- état des panneaux conservé localement dans le navigateur ;
- première couche d'objets graphiques indépendants des ressources :
  - rectangle,
  - ellipse,
  - losange,
  - annotation texte ;
- déplacement libre de ces objets dans la carte ;
- édition de leurs dimensions, couleurs, forme et texte dans l'inspecteur ;
- suppression par l'inspecteur ou la touche Suppr ;
- persistance des objets dans le JSON de la vue ;
- export SVG/PNG/PDF incluant formes et annotations.

L'outil **Image libre** reste réservé pour une étape suivante : sa persistance doit être conçue sans enfermer ou dupliquer silencieusement les fichiers utilisateur.

### V0.3.6 — fichiers texte, Markdown et exclusions ✅

- exclusions persistantes de fichiers/dossiers sans suppression physique ;
- exclusion rapide depuis le panneau de détails ;
- gestion centralisée des règles dans **Workspace → Exclusions** ;
- règles exactes et motifs simples comme `*.bak` ou `nppBackup/**` ;
- les exclusions sont enregistrées dans `.glom/workspace.json` ;
- les ressources exclues ne sont plus affichées, exportées ou comptées dans les tailles du workspace ;
- aperçu Markdown rendu par défaut, avec onglet **Source** ;
- édition directe des fichiers `.md` et `.txt` ;
- enregistrement dans le vrai fichier local via File System Access ;
- création directe d'un fichier texte ou Markdown dans le dossier sélectionné ;
- mise à jour immédiate de l'arborescence et de la mindmap sans rescan complet.

### V0.3.7 — canvas libre et géométrie avancée ✅

- canvas de travail non borné par le format d'impression : les nœuds et objets peuvent utiliser des coordonnées négatives ;
- l'A4 devient uniquement une **cible de rendu** : les limites du contenu sont calculées à l'export puis l'ensemble est ajusté à la page ;
- correction du hit-testing afin de pouvoir sélectionner à nouveau les formes libres placées sous la couche des nœuds ;
- largeur et hauteur des nœuds modifiables ;
- liens, cadres de branche, recentrage et exports adaptés aux dimensions propres de chaque nœud ;
- plages de taille étendues et curseurs corrigés pour exploiter toute leur largeur ;
- titre de cadre cliquable et double-cliquable pour le renommer directement ;
- contrôles typographiques cohérents pour titres de nœuds, annotations texte et titres de cadres ;
- option **Déplacer cette branche comme un groupe** : le déplacement du nœud racine conserve les positions relatives de tous ses descendants.

### V0.3.8 — gros workspaces et routage adaptatif ✅

- remplacement de la limite historique V0.1 de 1 200 éléments / profondeur 10 ;
- scan jusqu'à **20 000 éléments** et profondeur **48** avant garde-fou ;
- progression non modale pendant les scans volumineux afin de garder l'interface réactive ;
- si le véritable garde-fou est atteint, avertissement dans la barre d'état au lieu d'une boîte de dialogue bloquante ;
- connecteurs adaptatifs :
  - gauche/droite lorsque les nœuds sont principalement disposés horizontalement ;
  - haut/bas lorsque la relation est principalement verticale ;
- les connecteurs partent du milieu du bord pertinent de chaque boîte ;
- exports SVG/PNG/PDF utilisant le même routage adaptatif.

### V0.3.9 — relations nommées et stylables ✅

- sélection directe d'une relation dans la carte ;
- libellé éditable ;
- couleur et épaisseur personnalisables ;
- trait plein, pointillé ou en points ;
- flèche vers la cible ou aux deux extrémités ;
- courbure réglable jusqu'au lien droit ;
- styles persistés dans le JSON de vue ;
- styles des relations hiérarchiques conservés lors d'un rescan ;
- export SVG/PNG/PDF fidèle aux libellés, styles et flèches.

### V0.3.10 — images libres référencées ✅

- outil **Image** actif dans la palette de la mindmap ;
- sélection d'une image déjà présente dans le workspace ;
- l'objet visuel conserve une référence `resourceId` + chemin relatif, sans dupliquer le fichier image dans `.glom` ;
- déplacement et redimensionnement libres ;
- modes d'ajustement **Contenir / Recadrer / Étirer** ;
- réglage de l'opacité et de l'arrondi des coins ;
- double-clic pour ouvrir la ressource image originale ;
- les exports SVG/PNG/PDF incorporent temporairement les octets de l'image au moment du rendu, sans les persister dans la vue.

Le cas d'une image ajoutée **uniquement à la vue** (donc absente de l'arborescence utilisateur) reste à traiter séparément, probablement via `.glom/attachments/`.

### Prochaines priorités V0.3.x

Ordre de travail proposé après v0.3.10 :

1. **plusieurs cartes par workspace** et plusieurs occurrences visuelles d'une même ressource ;
3. **sélection multiple** et groupes/cadres arbitraires ;
4. **auto-layout horizontal, vertical et radial** ;
5. styles/thèmes réutilisables et duplication rapide d'un style sur une branche.

### Backlog V0.3.x

- plusieurs cartes par workspace ;
- ajouter plusieurs fois une même ressource dans une carte ;
- redimensionnement et verrouillage manuel des cadres/groupes ;
- sélection multiple ;
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
