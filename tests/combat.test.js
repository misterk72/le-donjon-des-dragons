// Mock de la classe CombatSystem pour les tests
class CombatSystem {
  constructor(game) {
    this.game = game;
    
    // Indique si le joueur est en combat
    this.inCombat = false;
    
    // Portée d'attaque du joueur (en cases)
    this.attackRange = 1;
    
    // Dégâts de base du joueur
    this.playerBaseDamage = 1;
    
    // Cooldown d'attaque (en millisecondes)
    this.attackCooldown = 500;
    this.lastAttackTime = 0;
    
    // Animations d'attaque
    this.attackAnimations = [];
  }
  
  // Mettre à jour le système de combat
  update(deltaTime) {
    // Mettre à jour les animations d'attaque
    this.updateAttackAnimations(deltaTime);
    
    // Vérifier si le joueur est en combat
    this.checkCombatStatus();
  }
  
  // Vérifier si le joueur est en combat (ennemi à proximité)
  checkCombatStatus() {
    // Si pas d'ennemis actifs, pas en combat
    if (!this.game.enemies || this.game.enemies.length === 0) {
      this.inCombat = false;
      return;
    }
    
    // Vérifier si un ennemi est à proximité
    const player = this.game.player;
    let enemyNearby = false;
    
    for (const enemy of this.game.enemies) {
      if (!enemy.active) continue;
      
      // Calculer la distance entre le joueur et l'ennemi
      const distX = Math.abs(player.gridX - enemy.gridX);
      const distY = Math.abs(player.gridY - enemy.gridY);
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      // Si un ennemi est à proximité, le joueur est en combat
      if (distance <= 5) { // 5 cases de distance
        enemyNearby = true;
        break;
      }
    }
    
    this.inCombat = enemyNearby;
  }
  
  // Attaquer dans la direction du joueur
  playerAttack() {
    // Vérifier le cooldown d'attaque
    const currentTime = Date.now(); // Utiliser Date.now() au lieu de performance.now() pour les tests
    if (currentTime - this.lastAttackTime < this.attackCooldown) {
      return false;
    }
    
    // Mettre à jour le temps de la dernière attaque
    this.lastAttackTime = currentTime;
    
    // Récupérer la position du joueur
    const player = this.game.player;
    
    // Déterminer la case cible en fonction de la direction du joueur
    let targetX = player.gridX;
    let targetY = player.gridY;
    
    switch (player.direction) {
      case 0: // Bas
        targetY++;
        break;
      case 1: // Gauche
        targetX--;
        break;
      case 2: // Droite
        targetX++;
        break;
      case 3: // Haut
        targetY--;
        break;
    }
    
    // Vérifier si un ennemi est présent sur la case cible
    let targetEnemy = null;
    for (const enemy of this.game.enemies) {
      if (enemy.active && enemy.gridX === targetX && enemy.gridY === targetY) {
        targetEnemy = enemy;
        break;
      }
    }
    
    // Si un ennemi est trouvé, l'attaquer
    if (targetEnemy) {
      // Calculer les dégâts
      const damage = this.calculatePlayerDamage();
      
      // Infliger les dégâts
      targetEnemy.takeDamage(damage);
      
      // Créer une animation d'attaque
      this.createAttackAnimation(player.x, player.y, targetEnemy.x, targetEnemy.y);
      
      // Terminer le tour du joueur
      this.game.endPlayerTurn();
      
      return true;
    }
    
    // Si aucun ennemi n'est trouvé, l'attaque échoue
    return false;
  }
  
  // Calculer les dégâts infligés par le joueur
  calculatePlayerDamage() {
    // Pour l'instant, dégâts de base
    return this.playerBaseDamage;
  }
  
  // Créer une animation d'attaque
  createAttackAnimation(startX, startY, endX, endY) {
    this.attackAnimations.push({
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      progress: 0,
      duration: 300, // ms
      color: '#ffffff'
    });
  }
  
  // Mettre à jour les animations d'attaque
  updateAttackAnimations(deltaTime) {
    const deltaTimeMs = deltaTime * 1000; // Convertir en millisecondes
    
    for (let i = this.attackAnimations.length - 1; i >= 0; i--) {
      const anim = this.attackAnimations[i];
      
      // Mettre à jour la progression
      anim.progress += deltaTimeMs / anim.duration;
      
      // Supprimer l'animation si elle est terminée
      if (anim.progress >= 1) {
        this.attackAnimations.splice(i, 1);
      }
    }
  }
  
  // Dessiner les animations d'attaque
  drawAttackAnimations() {
    const ctx = this.game.canvas.ctx;
    
    for (const anim of this.attackAnimations) {
      // Calculer la position actuelle
      const currentX = anim.startX + (anim.endX - anim.startX) * anim.progress;
      const currentY = anim.startY + (anim.endY - anim.startY) * anim.progress;
      
      // Dessiner la ligne d'attaque
      ctx.strokeStyle = anim.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1 - anim.progress; // Disparition progressive
      
      ctx.beginPath();
      ctx.moveTo(anim.startX, anim.startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      
      // Dessiner un cercle au point d'impact
      ctx.fillStyle = anim.color;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 5 * (1 - anim.progress), 0, Math.PI * 2);
      ctx.fill();
      
      // Rétablir l'alpha
      ctx.globalAlpha = 1;
    }
  }
}

// Tests unitaires pour la classe CombatSystem
describe('CombatSystem', () => {
  // Mock des dépendances
  let mockGame;
  let combatSystem;
  let originalDateNow;

  beforeEach(() => {
    // Sauvegarder la fonction Date.now() originale
    originalDateNow = Date.now;
    
    // Remplacer Date.now() par une fonction mock pour contrôler le temps
    Date.now = jest.fn(() => 1000);
    
    // Créer un mock du jeu
    mockGame = {
      player: {
        gridX: 5,
        gridY: 5,
        direction: 0, // Bas
        x: 250,
        y: 250
      },
      enemies: [],
      canvas: {
        ctx: {
          strokeStyle: '',
          lineWidth: 1,
          globalAlpha: 1,
          beginPath: jest.fn(),
          moveTo: jest.fn(),
          lineTo: jest.fn(),
          stroke: jest.fn(),
          fillStyle: '',
          arc: jest.fn(),
          fill: jest.fn()
        }
      },
      endPlayerTurn: jest.fn()
    };

    // Créer une instance de CombatSystem pour les tests
    combatSystem = new CombatSystem(mockGame);
  });
  
  afterEach(() => {
    // Restaurer la fonction Date.now() originale
    Date.now = originalDateNow;
  });

  test('Le système de combat doit être initialisé correctement', () => {
    expect(combatSystem.inCombat).toBe(false);
    expect(combatSystem.attackRange).toBe(1);
    expect(combatSystem.playerBaseDamage).toBe(1);
    expect(combatSystem.attackCooldown).toBe(500);
    expect(combatSystem.lastAttackTime).toBe(0);
    expect(combatSystem.attackAnimations).toEqual([]);
  });

  test('La méthode checkCombatStatus doit détecter si le joueur est en combat', () => {
    // Pas d'ennemis, pas en combat
    combatSystem.checkCombatStatus();
    expect(combatSystem.inCombat).toBe(false);

    // Ajouter un ennemi loin du joueur
    mockGame.enemies.push({
      active: true,
      gridX: 15,
      gridY: 15
    });
    combatSystem.checkCombatStatus();
    expect(combatSystem.inCombat).toBe(false);

    // Ajouter un ennemi proche du joueur
    mockGame.enemies.push({
      active: true,
      gridX: 6,
      gridY: 5
    });
    combatSystem.checkCombatStatus();
    expect(combatSystem.inCombat).toBe(true);

    // Désactiver l'ennemi proche
    mockGame.enemies[1].active = false;
    combatSystem.checkCombatStatus();
    expect(combatSystem.inCombat).toBe(false);
  });

  test('La méthode playerAttack doit attaquer un ennemi adjacent', () => {
    // Ajouter un ennemi adjacent au joueur (en bas)
    const mockEnemy = {
      active: true,
      gridX: 5,
      gridY: 6,
      takeDamage: jest.fn(),
      x: 250,
      y: 300,
      name: 'Gobelin'
    };
    mockGame.enemies.push(mockEnemy);

    // Simuler une attaque
    const result = combatSystem.playerAttack();

    // Vérifier que l'ennemi a été attaqué
    expect(result).toBe(true);
    expect(mockEnemy.takeDamage).toHaveBeenCalledWith(combatSystem.playerBaseDamage);
    expect(mockGame.endPlayerTurn).toHaveBeenCalled();
    expect(combatSystem.attackAnimations.length).toBe(1);
  });

  test('La méthode playerAttack doit échouer s\'il n\'y a pas d\'ennemi adjacent', () => {
    // Ajouter un ennemi non adjacent au joueur
    const mockEnemy = {
      active: true,
      gridX: 7,
      gridY: 7,
      takeDamage: jest.fn()
    };
    mockGame.enemies.push(mockEnemy);

    // Simuler une attaque
    const result = combatSystem.playerAttack();

    // Vérifier que l'attaque a échoué
    expect(result).toBe(false);
    expect(mockEnemy.takeDamage).not.toHaveBeenCalled();
    expect(mockGame.endPlayerTurn).not.toHaveBeenCalled();
    expect(combatSystem.attackAnimations.length).toBe(0);
  });

  test('La méthode playerAttack doit respecter le cooldown', () => {
    // Ajouter un ennemi adjacent au joueur
    const mockEnemy = {
      active: true,
      gridX: 5,
      gridY: 6,
      takeDamage: jest.fn(),
      x: 250,
      y: 300
    };
    mockGame.enemies.push(mockEnemy);

    // Première attaque réussie
    const result1 = combatSystem.playerAttack();
    expect(result1).toBe(true);
    expect(mockEnemy.takeDamage).toHaveBeenCalledTimes(1);

    // Réinitialiser le mock
    mockEnemy.takeDamage.mockClear();

    // Deuxième attaque immédiate (devrait échouer à cause du cooldown)
    const result2 = combatSystem.playerAttack();
    expect(result2).toBe(false);
    expect(mockEnemy.takeDamage).not.toHaveBeenCalled();

    // Simuler le passage du temps (après le cooldown)
    Date.now.mockReturnValue(2000); // 1000ms plus tard

    // Troisième attaque après le cooldown (devrait réussir)
    const result3 = combatSystem.playerAttack();
    expect(result3).toBe(true);
    expect(mockEnemy.takeDamage).toHaveBeenCalledTimes(1);
  });

  test('La méthode calculatePlayerDamage doit retourner les dégâts de base du joueur', () => {
    // Calculer les dégâts
    const damage = combatSystem.calculatePlayerDamage();

    // Vérifier que les dégâts sont corrects
    expect(damage).toBe(combatSystem.playerBaseDamage);
  });

  test('La méthode createAttackAnimation doit créer une animation d\'attaque', () => {
    // Créer une animation
    combatSystem.createAttackAnimation(100, 100, 200, 200);

    // Vérifier que l'animation a été créée
    expect(combatSystem.attackAnimations.length).toBe(1);
    expect(combatSystem.attackAnimations[0].startX).toBe(100);
    expect(combatSystem.attackAnimations[0].startY).toBe(100);
    expect(combatSystem.attackAnimations[0].endX).toBe(200);
    expect(combatSystem.attackAnimations[0].endY).toBe(200);
    expect(combatSystem.attackAnimations[0].progress).toBe(0);
    expect(combatSystem.attackAnimations[0].duration).toBe(300);
    expect(combatSystem.attackAnimations[0].color).toBe('#ffffff');
  });

  test('La méthode updateAttackAnimations doit mettre à jour les animations', () => {
    // Créer une animation
    combatSystem.createAttackAnimation(100, 100, 200, 200);
    const animation = combatSystem.attackAnimations[0];

    // Mettre à jour l'animation avec un petit deltaTime
    combatSystem.updateAttackAnimations(0.1); // 100ms

    // Vérifier que la progression a augmenté
    expect(animation.progress).toBeCloseTo(0.1 * 1000 / 300, 5); // 0.33
    expect(combatSystem.attackAnimations.length).toBe(1);

    // Mettre à jour l'animation avec un grand deltaTime pour la terminer
    combatSystem.updateAttackAnimations(0.3); // 300ms

    // Vérifier que l'animation a été supprimée
    expect(combatSystem.attackAnimations.length).toBe(0);
  });

  test('La méthode drawAttackAnimations doit dessiner les animations', () => {
    // Créer une animation
    combatSystem.createAttackAnimation(100, 100, 200, 200);
    combatSystem.attackAnimations[0].progress = 0.5; // Mi-chemin

    // Dessiner les animations
    combatSystem.drawAttackAnimations();

    // Vérifier que les méthodes de dessin ont été appelées
    expect(mockGame.canvas.ctx.beginPath).toHaveBeenCalledTimes(2); // Une fois pour la ligne, une fois pour le cercle
    expect(mockGame.canvas.ctx.moveTo).toHaveBeenCalledWith(100, 100);
    expect(mockGame.canvas.ctx.lineTo).toHaveBeenCalled();
    expect(mockGame.canvas.ctx.stroke).toHaveBeenCalled();
    expect(mockGame.canvas.ctx.arc).toHaveBeenCalled();
    expect(mockGame.canvas.ctx.fill).toHaveBeenCalled();
  });
});
