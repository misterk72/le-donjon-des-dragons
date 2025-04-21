/**
 * Tests unitaires pour la classe Enemy
 */

// Classe Enemy simplifiée pour les tests
class Enemy {
  constructor(game, gridX, gridY, type = 'basic') {
    this.game = game;
    this.gridX = gridX;
    this.gridY = gridY;
    this.width = 30;
    this.height = 30;
    this.gridSize = this.game.gridSize;
    this.x = this.gridX * this.gridSize + (this.gridSize - this.width) / 2;
    this.y = this.gridY * this.gridSize + (this.gridSize - this.height) / 2;
    this.type = type;
    this.direction = 0;
    this.isMoving = false;
    this.targetX = this.x;
    this.targetY = this.y;
    this.moveSpeed = 3;
    this.hasMoved = false;
    this.detectionRange = 5;
    this.active = true;
    
    this.setAttributes();
  }
  
  setAttributes() {
    switch (this.type) {
      case 'basic':
        this.health = 3;
        this.maxHealth = 3;
        this.damage = 1;
        this.name = 'Gobelin';
        break;
      case 'fast':
        this.health = 2;
        this.maxHealth = 2;
        this.damage = 1;
        this.moveSpeed = 4;
        this.name = 'Rat';
        break;
      case 'tank':
        this.health = 5;
        this.maxHealth = 5;
        this.damage = 2;
        this.moveSpeed = 2;
        this.name = 'Ogre';
        break;
      default:
        this.health = 3;
        this.maxHealth = 3;
        this.damage = 1;
        this.name = 'Monstre';
    }
  }
  
  decideAction() {
    const distX = this.gridX - this.game.player.gridX;
    const distY = this.gridY - this.game.player.gridY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    if (distance <= 1) {
      this.attack();
    } else if (distance <= this.detectionRange) {
      this.moveTowardsPlayer();
    } else {
      this.moveRandomly();
    }
    
    this.hasMoved = true;
  }
  
  attack() {
    this.game.player.takeDamage(this.damage);
    
    if (this.gridX < this.game.player.gridX) {
      this.direction = 2; // Droite
    } else if (this.gridX > this.game.player.gridX) {
      this.direction = 1; // Gauche
    } else if (this.gridY < this.game.player.gridY) {
      this.direction = 0; // Bas
    } else {
      this.direction = 3; // Haut
    }
  }
  
  moveTowardsPlayer() {
    // Simplifié pour les tests
  }
  
  moveRandomly() {
    // Simplifié pour les tests
  }
  
  checkCollision(gridX, gridY) {
    if (gridX < 0 || gridY < 0 || 
        gridX >= this.game.worldWidth / this.gridSize || 
        gridY >= this.game.worldHeight / this.gridSize) {
      return true;
    }
    
    if (this.game.dungeon.isWall(gridX, gridY)) {
      return true;
    }
    
    if (gridX === this.game.player.gridX && gridY === this.game.player.gridY) {
      return true;
    }
    
    for (const enemy of this.game.enemies) {
      if (enemy !== this && enemy.active && enemy.gridX === gridX && enemy.gridY === gridY) {
        return true;
      }
    }
    
    return false;
  }
  
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.active = false;
    this.game.gameState.addScore(this.type === 'basic' ? 10 : this.type === 'fast' ? 15 : 20);
    this.game.ui.updateScore();
  }
}

// Tests unitaires pour la classe Enemy
describe('Enemy', () => {
  // Mock des dépendances
  let mockGame;
  let enemy;

  beforeEach(() => {
    // Créer un mock du jeu
    mockGame = {
      gridSize: 50,
      worldWidth: 1000,
      worldHeight: 800,
      enemyTurn: true,
      dungeon: {
        isWall: jest.fn().mockReturnValue(false)
      },
      player: {
        gridX: 10,
        gridY: 10,
        takeDamage: jest.fn()
      },
      enemies: [],
      gameState: {
        addScore: jest.fn()
      },
      ui: {
        updateScore: jest.fn()
      }
    };

    // Créer une instance d'Enemy pour les tests
    enemy = new Enemy(mockGame, 5, 5, 'basic');
    mockGame.enemies.push(enemy);
  });

  test('L\'ennemi doit être initialisé correctement', () => {
    expect(enemy.width).toBe(30);
    expect(enemy.height).toBe(30);
    expect(enemy.type).toBe('basic');
    expect(enemy.health).toBe(3);
    expect(enemy.damage).toBe(1);
    expect(enemy.active).toBe(true);
    expect(enemy.isMoving).toBe(false);
    expect(enemy.hasMoved).toBe(false);
  });

  test('L\'ennemi doit avoir des attributs différents selon son type', () => {
    // Tester le type 'fast'
    const fastEnemy = new Enemy(mockGame, 6, 6, 'fast');
    expect(fastEnemy.health).toBe(2);
    expect(fastEnemy.damage).toBe(1);
    expect(fastEnemy.moveSpeed).toBeGreaterThan(enemy.moveSpeed);

    // Tester le type 'tank'
    const tankEnemy = new Enemy(mockGame, 7, 7, 'tank');
    expect(tankEnemy.health).toBe(5);
    expect(tankEnemy.damage).toBe(2);
    expect(tankEnemy.moveSpeed).toBeLessThan(enemy.moveSpeed);
  });

  test('L\'ennemi doit attaquer le joueur s\'il est adjacent', () => {
    // Positionner l'ennemi à côté du joueur
    enemy.gridX = mockGame.player.gridX - 1;
    enemy.gridY = mockGame.player.gridY;

    // Simuler la décision d'action
    enemy.decideAction();

    // Vérifier que l'ennemi a attaqué le joueur
    expect(mockGame.player.takeDamage).toHaveBeenCalledWith(enemy.damage);
    expect(enemy.direction).toBe(2); // Direction droite (vers le joueur)
    expect(enemy.hasMoved).toBe(true);
  });

  test('L\'ennemi doit se déplacer vers le joueur s\'il est à portée de détection', () => {
    // Positionner l'ennemi à portée de détection du joueur
    enemy.gridX = mockGame.player.gridX - 3;
    enemy.gridY = mockGame.player.gridY;
    enemy.detectionRange = 5;

    // Remplacer temporairement la méthode moveTowardsPlayer par un mock
    const originalMoveTowardsPlayer = enemy.moveTowardsPlayer;
    enemy.moveTowardsPlayer = jest.fn();

    // Simuler la décision d'action
    enemy.decideAction();

    // Vérifier que l'ennemi a essayé de se déplacer vers le joueur
    expect(enemy.moveTowardsPlayer).toHaveBeenCalled();
    expect(enemy.hasMoved).toBe(true);

    // Restaurer la méthode originale
    enemy.moveTowardsPlayer = originalMoveTowardsPlayer;
  });
  
  test('L\'ennemi doit perdre de la santé quand il prend des dégâts', () => {
    // Santé initiale
    const initialHealth = enemy.health;

    // Infliger des dégâts
    enemy.takeDamage(1);

    // Vérifier que la santé a diminué
    expect(enemy.health).toBe(initialHealth - 1);
  });

  test('L\'ennemi doit mourir quand sa santé atteint 0', () => {
    // Remplacer temporairement la méthode die par un mock
    const originalDie = enemy.die;
    enemy.die = jest.fn();

    // Infliger des dégâts mortels
    enemy.takeDamage(enemy.health);

    // Vérifier que l'ennemi est mort
    expect(enemy.health).toBe(0);
    expect(enemy.die).toHaveBeenCalled();

    // Restaurer la méthode originale
    enemy.die = originalDie;
  });

  test('L\'ennemi doit être désactivé et ajouter des points au score quand il meurt', () => {
    // Simuler la mort de l'ennemi
    enemy.die();

    // Vérifier que l'ennemi est désactivé
    expect(enemy.active).toBe(false);
    expect(mockGame.gameState.addScore).toHaveBeenCalled();
    expect(mockGame.ui.updateScore).toHaveBeenCalled();
  });

  test('L\'ennemi ne doit pas traverser les murs', () => {
    // Simuler un mur à droite
    mockGame.dungeon.isWall.mockImplementation((x, y) => {
      return x === enemy.gridX + 1 && y === enemy.gridY;
    });

    // Tenter de se déplacer vers la droite
    const result = enemy.checkCollision(enemy.gridX + 1, enemy.gridY);

    // Vérifier qu'il y a collision
    expect(result).toBe(true);
  });

  test('L\'ennemi ne doit pas traverser d\'autres ennemis', () => {
    // Créer un nouvel ennemi à droite
    const otherEnemy = {
      gridX: enemy.gridX + 1,
      gridY: enemy.gridY,
      active: true
    };
    
    // Ajouter l'ennemi au tableau des ennemis
    mockGame.enemies.push(otherEnemy);

    // Tenter de se déplacer vers la droite
    const result = enemy.checkCollision(enemy.gridX + 1, enemy.gridY);

    // Vérifier qu'il y a collision
    expect(result).toBe(true);
  });
});
