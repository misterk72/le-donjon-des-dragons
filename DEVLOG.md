# Journal de développement

## Liste des tâches

### Phase 1 : Structure de base
- [x] Créer la structure des fichiers (index.html, style.css, main.js)
- [x] Mettre en place le canvas pour le rendu du jeu
- [x] Implémenter la boucle de jeu principale
- [x] Créer le système de gestion des états du jeu (menu, jeu, pause)

### Phase 2 : Système de jeu fondamental
- [x] Implémenter le système de déplacement du joueur
- [x] Créer la classe Player avec les attributs de base (vie, position)
- [x] Développer le système de collision
- [x] Ajouter l'animation basique du personnage
- [x] Créer la caméra qui suit le joueur

### Phase 3 : Génération du donjon
- [x] Implémenter l'algorithme de génération procédurale des salles
- [x] Créer le système de connexion des salles
- [x] Ajouter les murs et les obstacles
- [x] Implémenter la génération des portes

### Phase 4 : Combat et Ennemis
- [x] Créer le système de combat basique
- [x] Implémenter la classe Enemy
- [x] Ajouter différents types d'ennemis
- [x] Développer l'IA des ennemis
- [x] Implémenter le système de dégâts

### Phase 5 : Items et Progression
- [ ] Créer le système d'inventaire
- [ ] Implémenter différents types d'objets (armes, potions)
- [ ] Ajouter le système de score
- [ ] Développer le système de progression du personnage
- [ ] Implémenter la sauvegarde de la progression

### Phase 6 : Interface utilisateur
- [ ] Créer l'interface du menu principal
- [ ] Ajouter la barre de vie et autres indicateurs
- [ ] Implémenter le menu de pause
- [ ] Créer l'écran de fin de partie
- [ ] Ajouter des effets sonores et musique

### Phase 7 : Polissage
- [ ] Ajouter des effets visuels (particules, animations)
- [ ] Équilibrer la difficulté
- [ ] Optimiser les performances
- [ ] Corriger les bugs
- [ ] Ajouter des achievements

## Journal des modifications

### 21/04/2025
- Création initiale du projet
- Mise en place du README.md et DEVLOG.md
- Implémentation de la structure de base du jeu (Phase 1)
  - Création des fichiers HTML, CSS et JavaScript
  - Mise en place du canvas et de la boucle de jeu
  - Implémentation du système de gestion des états du jeu
  - Création de l'interface utilisateur de base
- Implémentation du système de jeu fondamental (Phase 2)
  - Création de la classe Player avec système de déplacement
  - Développement du système de collision
  - Ajout d'animations basiques pour le personnage
  - Implémentation de la caméra qui suit le joueur
- Implémentation de la génération procédurale du donjon (Phase 3)
  - Création de l'algorithme de génération des salles
  - Implémentation du système de connexion des salles par des couloirs
  - Ajout des murs et obstacles avec détection de collision
  - Intégration du donjon dans le jeu
- Implémentation du système de combat et des ennemis (Phase 4)
  - Création de la classe Enemy avec différents types d'ennemis
  - Développement du système de combat en tour par tour
  - Implémentation de l'IA des ennemis
  - Ajout du système de dégâts et de la gestion des tours
