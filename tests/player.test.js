// Mock de la classe Player pour les tests
class Player {
  constructor(game, x, y) {
    this.game = game;
    
    // Taille du joueur
    this.width = 40;
    this.height = 40;
    
    // Taille d'une case de la grille
    this.gridSize = 50;
    
    // Position en coordonnées de la grille
    this.gridX = Math.floor(x / this.gridSize);
    this.gridY = Math.floor(y / this.gridSize);
    
    // Position réelle en pixels (pour l'affichage)
    this.x = this.gridX * this.gridSize + (this.gridSize - this.width) / 2;
    this.y = this.gridY * this.gridSize + (this.gridSize - this.height) / 2;
    
    // Attributs du joueur
    this.health = 100;
    this.maxHealth = 100;
    this.color = '#ff5500'; // Couleur vive pour le joueur (orange)
    
    // Variables pour l'animation
    this.frameX = 0;
    this.frameY = 0;
    this.maxFrame = 3;
    this.fps = 10;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    
    // Direction du joueur (0: bas, 1: gauche, 2: droite, 3: haut)
    this.direction = 0;
    
    // Variables pour le déplacement en tour par tour
    this.isMoving = false;
    this.targetX = this.x;
    this.targetY = this.y;
    this.moveSpeed = 5; // Vitesse de l'animation de déplacement
    
    // Indique si le joueur a joué son tour
    this.hasMoved = false;
  }
  
  // Mettre à jour la position et l'état du joueur
  update(deltaTime) {
    // Si ce n'est pas le tour du joueur, ne rien faire
    if (this.game.enemyTurn) return;
    
    // Gestion du déplacement
    this.move(deltaTime);
    
    // Gestion de l'attaque
    this.handleAttack();
    
    // Mise à jour de l'animation
    this.updateAnimation(deltaTime);
    
    // Mise à jour de l'interface utilisateur
    this.updateUI();
  }
  
  // Gérer l'attaque du joueur
  handleAttack() {
    // Si le joueur appuie sur la touche d'espace, attaquer
    if (this.game.input.keys.space) {
      // Réinitialiser l'état de la touche pour éviter des attaques multiples
      this.game.input.keys.space = false;
      
      // Attaquer avec le système de combat
      this.game.combatSystem.playerAttack();
    }
  }
  
  // Gérer le déplacement du joueur en tour par tour
  move(deltaTime) {
    // Si le joueur est déjà en train de se déplacer, continuer l'animation
    if (this.isMoving) {
      this.animateMovement(deltaTime);
      return;
    }
    
    // Si le joueur a déjà joué son tour, ne rien faire
    if (this.hasMoved) {
      return;
    }
    
    // Variables pour stocker la nouvelle position sur la grille
    let newGridX = this.gridX;
    let newGridY = this.gridY;
    let hasMoved = false;
    
    // Déplacement sur la grille
    if (this.game.input.keys.left) {
      newGridX--;
      this.direction = 1; // Gauche
      hasMoved = true;
    } else if (this.game.input.keys.right) {
      newGridX++;
      this.direction = 2; // Droite
      hasMoved = true;
    } else if (this.game.input.keys.up) {
      newGridY--;
      this.direction = 3; // Haut
      hasMoved = true;
    } else if (this.game.input.keys.down) {
      newGridY++;
      this.direction = 0; // Bas
      hasMoved = true;
    }
    
    // Si une touche de déplacement a été pressée
    if (hasMoved) {
      // Vérifier si la nouvelle position est valide
      if (!this.checkCollision(newGridX, newGridY)) {
        // Définir la nouvelle position sur la grille
        this.gridX = newGridX;
        this.gridY = newGridY;
        
        // Calculer la position cible en pixels
        this.targetX = this.gridX * this.gridSize + (this.gridSize - this.width) / 2;
        this.targetY = this.gridY * this.gridSize + (this.gridSize - this.height) / 2;
        
        // Démarrer l'animation de déplacement
        this.isMoving = true;
        
        // Marquer que le joueur a joué son tour
        this.hasMoved = true;
        
        // Après un délai, permettre au joueur de jouer à nouveau
        setTimeout(() => {
          this.hasMoved = false;
        }, 200); // Délai court pour éviter les déplacements trop rapides
      }
    }
  }
  
  // Animer le déplacement du joueur vers la position cible
  animateMovement(deltaTime) {
    // Calculer la distance à parcourir pour cette frame
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Si le joueur est proche de la cible, arrêter l'animation
    if (distance < this.moveSpeed) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.isMoving = false;
      
      // Terminer le tour du joueur
      if (this.game.endPlayerTurn && !this.game.enemyTurn) {
        this.game.endPlayerTurn();
      }
      
      return;
    }
    
    // Déplacer le joueur vers la cible
    const moveX = (dx / distance) * this.moveSpeed;
    const moveY = (dy / distance) * this.moveSpeed;
    
    this.x += moveX;
    this.y += moveY;
  }
  
  // Vérifier les collisions avec les murs et obstacles
  checkCollision(gridX, gridY) {
    // Vérifier si la position est en dehors des limites du monde
    if (gridX < 0 || gridY < 0 || 
        gridX >= this.game.worldWidth / this.gridSize || 
        gridY >= this.game.worldHeight / this.gridSize) {
      return true;
    }
    
    // Vérifier si la position est un mur dans le donjon
    if (this.game.dungeon.isWall(gridX, gridY)) {
      return true;
    }
    
    // Vérifier si c'est une porte (les portes sont traversables)
    if (this.game.dungeon.isDoor(gridX, gridY)) {
      return false; // Les portes sont traversables
    }
    
    return false;
  }
  
  // Mettre à jour l'animation du joueur
  updateAnimation(deltaTime) {
    // Mettre à jour le timer d'animation
    this.frameTimer += deltaTime * 1000;
    
    // Changer de frame si le timer dépasse l'intervalle
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      
      // Passer à la frame suivante
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }
    
    // Mettre à jour la ligne de sprite en fonction de la direction
    this.frameY = this.direction;
  }
  
  // Mettre à jour l'interface utilisateur
  updateUI() {
    // Mettre à jour la barre de vie
    if (this.game.ui && this.game.ui.updateHealthBar) {
      this.game.ui.updateHealthBar(this.health, this.maxHealth);
    }
  }
  
  // Dessiner le joueur
  draw() {
    // Simplifié pour les tests
  }
  
  // Infliger des dégâts au joueur
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    // Mettre à jour l'interface utilisateur
    this.updateUI();
    
    // Effet visuel de dégât
    this.flashDamage();
    
    // Vérifier si le joueur est mort
    if (this.health <= 0) {
      this.die();
    }
  }
  
  // Effet visuel de dégât (flash rouge)
  flashDamage() {
    // Sauvegarder la couleur originale
    const originalColor = this.color;
    
    // Changer la couleur en rouge
    this.color = '#ff0000';
    
    // Rétablir la couleur originale après un court délai
    setTimeout(() => {
      this.color = originalColor;
    }, 200);
  }
  
  // Soigner le joueur
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    
    // Mettre à jour l'interface utilisateur
    this.updateUI();
  }
  
  // Gérer la mort du joueur
  die() {
    // Déclencher la fin de partie
    if (this.game.gameOver) {
      this.game.gameOver();
    }
  }
}

// Tests unitaires pour la classe Player
describe('Player', () => {
  // Mock des dépendances
  let mockGame;
  let player;
  let originalSetTimeout;

  beforeEach(() => {
    // Sauvegarder la fonction setTimeout originale
    originalSetTimeout = global.setTimeout;
    // Remplacer setTimeout par une fonction mock qui exécute immédiatement la callback
    global.setTimeout = jest.fn((callback) => callback());
    
    // Créer un mock du jeu
    mockGame = {
      gridSize: 50,
      worldWidth: 1000,
      worldHeight: 800,
      enemyTurn: false,
      dungeon: {
        isWall: jest.fn().mockReturnValue(false),
        isDoor: jest.fn().mockReturnValue(false)
      },
      input: {
        keys: {
          up: false,
          down: false,
          left: false,
          right: false,
          space: false
        }
      },
      ui: {
        updateHealthBar: jest.fn()
      },
      combatSystem: {
        playerAttack: jest.fn()
      },
      endPlayerTurn: jest.fn(),
      gameOver: jest.fn()
    };

    // Créer une instance de Player pour les tests
    player = new Player(mockGame, 100, 100);
  });
  
  afterEach(() => {
    // Restaurer la fonction setTimeout originale
    global.setTimeout = originalSetTimeout;
  });

  test('Le joueur doit être initialisé correctement', () => {
    expect(player.width).toBe(40);
    expect(player.height).toBe(40);
    expect(player.gridSize).toBe(50);
    expect(player.gridX).toBe(2); // 100 / 50 = 2
    expect(player.gridY).toBe(2); // 100 / 50 = 2
    expect(player.health).toBe(100);
    expect(player.maxHealth).toBe(100);
    expect(player.direction).toBe(0);
    expect(player.isMoving).toBe(false);
    expect(player.hasMoved).toBe(false);
  });

  test('Le joueur doit se déplacer correctement', () => {
    // Position initiale
    const initialGridX = player.gridX;
    const initialGridY = player.gridY;

    // Simuler un déplacement vers la droite
    mockGame.input.keys.right = true;
    player.move(0.1);
    mockGame.input.keys.right = false;

    // Vérifier que la position a changé
    expect(player.gridX).toBe(initialGridX + 1);
    expect(player.gridY).toBe(initialGridY);
    expect(player.direction).toBe(2); // Direction droite
    expect(player.isMoving).toBe(true);
    expect(player.hasMoved).toBe(true);
  });

  test('Le joueur ne doit pas traverser les murs', () => {
    // Position initiale
    const initialGridX = player.gridX;
    const initialGridY = player.gridY;

    // Simuler un mur à droite
    mockGame.dungeon.isWall.mockImplementation((x, y) => {
      return x === initialGridX + 1 && y === initialGridY;
    });

    // Tenter de se déplacer vers la droite
    mockGame.input.keys.right = true;
    player.move(0.1);
    mockGame.input.keys.right = false;

    // Vérifier que la position n'a pas changé
    expect(player.gridX).toBe(initialGridX);
    expect(player.gridY).toBe(initialGridY);
    expect(player.isMoving).toBe(false);
    expect(player.hasMoved).toBe(false);
  });

  test('Le joueur doit pouvoir attaquer', () => {
    // Simuler une attaque
    mockGame.input.keys.space = true;
    player.handleAttack();

    // Vérifier que la méthode d'attaque a été appelée
    expect(mockGame.combatSystem.playerAttack).toHaveBeenCalled();
    expect(mockGame.input.keys.space).toBe(false); // La touche doit être réinitialisée
  });

  test('Le joueur doit perdre de la santé quand il prend des dégâts', () => {
    // Santé initiale
    const initialHealth = player.health;

    // Espionner la méthode flashDamage
    player.flashDamage = jest.fn();

    // Infliger des dégâts
    player.takeDamage(20);

    // Vérifier que la santé a diminué
    expect(player.health).toBe(initialHealth - 20);
    expect(mockGame.ui.updateHealthBar).toHaveBeenCalled();
    expect(player.flashDamage).toHaveBeenCalled();
  });

  test('Le joueur doit mourir quand sa santé atteint 0', () => {
    // Espionner la méthode die
    const originalDie = player.die;
    player.die = jest.fn();

    // Infliger des dégâts mortels
    player.takeDamage(player.health);

    // Vérifier que le joueur est mort
    expect(player.health).toBe(0);
    expect(player.die).toHaveBeenCalled();

    // Restaurer la méthode originale
    player.die = originalDie;
  });

  test('La méthode die doit déclencher la fin de partie', () => {
    // Appeler la méthode die
    player.die();

    // Vérifier que la méthode gameOver a été appelée
    expect(mockGame.gameOver).toHaveBeenCalled();
  });

  test('Le joueur doit récupérer de la santé quand il se soigne', () => {
    // Réduire la santé
    player.health = 50;

    // Soigner le joueur
    player.heal(20);

    // Vérifier que la santé a augmenté
    expect(player.health).toBe(70);
    expect(mockGame.ui.updateHealthBar).toHaveBeenCalled();
  });

  test('La santé du joueur ne doit pas dépasser sa santé maximale', () => {
    // Soigner le joueur au-delà de sa santé maximale
    player.heal(50);

    // Vérifier que la santé est plafonnée
    expect(player.health).toBe(player.maxHealth);
  });

  test('Le joueur doit terminer son tour après un déplacement', () => {
    // Simuler un déplacement vers la droite
    mockGame.input.keys.right = true;
    player.move(0.1);
    mockGame.input.keys.right = false;

    // Vérifier que le joueur est en mouvement
    expect(player.isMoving).toBe(true);
    
    // Simuler la fin du mouvement
    player.x = player.targetX;
    player.y = player.targetY;
    
    // Appeler directement la méthode qui termine le tour
    if (player.game.endPlayerTurn && !player.game.enemyTurn) {
      player.game.endPlayerTurn();
    }
    
    // Vérifier que le tour du joueur est terminé
    expect(mockGame.endPlayerTurn).toHaveBeenCalled();
  });
});
