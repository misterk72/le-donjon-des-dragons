// Tests unitaires pour la classe Game
describe('Game', () => {
  let game;
  let mockCanvas;
  let mockContext;

  beforeEach(() => {
    // Créer un mock du canvas et du contexte
    mockContext = {
      clearRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      fillStyle: '',
      fillRect: jest.fn(),
      font: '',
      fillText: jest.fn()
    };

    mockCanvas = {
      width: 800,
      height: 600,
      getContext: jest.fn().mockReturnValue(mockContext)
    };

    // Mock du document pour les éléments DOM
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'gameCanvas') return mockCanvas;
      if (id === 'healthBar') return { style: { width: '' } };
      if (id === 'scoreValue') return { textContent: '' };
      if (id === 'levelValue') return { textContent: '' };
      return null;
    });

    // Créer une instance de Game pour les tests
    game = new Game();
  });

  test('Le jeu doit être initialisé correctement', () => {
    expect(game.canvas).toBe(mockCanvas);
    expect(game.ctx).toBe(mockContext);
    expect(game.gridSize).toBe(50);
    expect(game.gridWidth).toBeGreaterThan(0);
    expect(game.gridHeight).toBeGreaterThan(0);
    expect(game.worldWidth).toBe(game.gridWidth * game.gridSize);
    expect(game.worldHeight).toBe(game.gridHeight * game.gridSize);
    expect(game.gameState).toBeDefined();
    expect(game.input).toBeDefined();
    expect(game.camera).toBeDefined();
    expect(game.ui).toBeDefined();
    expect(game.player).toBeDefined();
    expect(game.dungeon).toBeDefined();
    expect(game.combatSystem).toBeDefined();
    expect(game.enemies).toEqual([]);
    expect(game.minEnemies).toBeGreaterThan(0);
    expect(game.maxEnemies).toBeGreaterThan(game.minEnemies);
    expect(game.enemyTurn).toBe(false);
  });

  test('La méthode init doit initialiser le jeu', () => {
    // Espionner les méthodes
    game.setupEventListeners = jest.fn();
    game.generateDungeon = jest.fn();
    game.generateEnemies = jest.fn();
    game.placePlayerInStartRoom = jest.fn();
    game.gameLoop = jest.fn();

    // Initialiser le jeu
    game.init();

    // Vérifier que les méthodes ont été appelées
    expect(game.setupEventListeners).toHaveBeenCalled();
    expect(game.generateDungeon).toHaveBeenCalled();
    expect(game.generateEnemies).toHaveBeenCalled();
    expect(game.placePlayerInStartRoom).toHaveBeenCalled();
    expect(game.gameLoop).toHaveBeenCalled();
  });

  test('La méthode generateDungeon doit générer un donjon', () => {
    // Espionner la méthode generate du donjon
    game.dungeon.generate = jest.fn();

    // Générer le donjon
    game.generateDungeon();

    // Vérifier que la méthode a été appelée
    expect(game.dungeon.generate).toHaveBeenCalled();
  });

  test('La méthode generateEnemies doit créer des ennemis', () => {
    // Configurer des salles de donjon pour le test
    game.dungeon.rooms = [
      { x: 1, y: 1, width: 5, height: 5 },
      { x: 10, y: 10, width: 5, height: 5 }
    ];

    // Générer les ennemis
    game.generateEnemies();

    // Vérifier que des ennemis ont été créés
    expect(game.enemies.length).toBeGreaterThan(0);
    expect(game.enemies.length).toBeLessThanOrEqual(game.maxEnemies);
  });

  test('La méthode placePlayerInStartRoom doit placer le joueur dans la première salle', () => {
    // Configurer une salle de donjon pour le test
    game.dungeon.rooms = [
      { x: 5, y: 5, width: 5, height: 5 }
    ];

    // Placer le joueur
    game.placePlayerInStartRoom();

    // Vérifier que le joueur est dans la première salle
    expect(game.player.gridX).toBeGreaterThanOrEqual(game.dungeon.rooms[0].x);
    expect(game.player.gridX).toBeLessThan(game.dungeon.rooms[0].x + game.dungeon.rooms[0].width);
    expect(game.player.gridY).toBeGreaterThanOrEqual(game.dungeon.rooms[0].y);
    expect(game.player.gridY).toBeLessThan(game.dungeon.rooms[0].y + game.dungeon.rooms[0].height);
  });

  test('La méthode update doit mettre à jour les composants du jeu', () => {
    // Configurer le deltaTime
    const deltaTime = 0.1;

    // Espionner les méthodes
    game.player.update = jest.fn();
    game.camera.follow = jest.fn();
    game.combatSystem.updateAttackAnimations = jest.fn();
    game.updateEnemies = jest.fn();

    // Mettre à jour le jeu
    game.update(deltaTime);

    // Vérifier que les méthodes ont été appelées
    expect(game.player.update).toHaveBeenCalledWith(deltaTime);
    expect(game.camera.follow).toHaveBeenCalledWith(game.player);
    expect(game.combatSystem.updateAttackAnimations).toHaveBeenCalledWith(deltaTime);
    expect(game.updateEnemies).toHaveBeenCalledWith(deltaTime);
  });

  test('La méthode draw doit dessiner les composants du jeu', () => {
    // Espionner les méthodes
    game.drawDungeon = jest.fn();
    game.drawEnemies = jest.fn();
    game.player.draw = jest.fn();
    game.combatSystem.drawAttackAnimations = jest.fn();
    game.ui.draw = jest.fn();

    // Dessiner le jeu
    game.draw();

    // Vérifier que les méthodes ont été appelées
    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.translate).toHaveBeenCalled();
    expect(game.drawDungeon).toHaveBeenCalled();
    expect(game.drawEnemies).toHaveBeenCalled();
    expect(game.player.draw).toHaveBeenCalled();
    expect(game.combatSystem.drawAttackAnimations).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();
    expect(game.ui.draw).toHaveBeenCalled();
  });

  test('La méthode updateEnemies doit mettre à jour les ennemis', () => {
    // Configurer le deltaTime
    const deltaTime = 0.1;

    // Créer des ennemis pour le test
    game.enemies = [
      { active: true, update: jest.fn() },
      { active: true, update: jest.fn() },
      { active: false, update: jest.fn() }
    ];

    // Mettre à jour les ennemis
    game.updateEnemies(deltaTime);

    // Vérifier que seuls les ennemis actifs ont été mis à jour
    expect(game.enemies[0].update).toHaveBeenCalledWith(deltaTime);
    expect(game.enemies[1].update).toHaveBeenCalledWith(deltaTime);
    expect(game.enemies[2].update).not.toHaveBeenCalled();
  });

  test('La méthode drawEnemies doit dessiner les ennemis', () => {
    // Créer des ennemis pour le test
    game.enemies = [
      { active: true, draw: jest.fn() },
      { active: true, draw: jest.fn() },
      { active: false, draw: jest.fn() }
    ];

    // Dessiner les ennemis
    game.drawEnemies();

    // Vérifier que seuls les ennemis actifs ont été dessinés
    expect(game.enemies[0].draw).toHaveBeenCalled();
    expect(game.enemies[1].draw).toHaveBeenCalled();
    expect(game.enemies[2].draw).not.toHaveBeenCalled();
  });

  test('La méthode endPlayerTurn doit passer le tour aux ennemis', () => {
    // Tour initial du joueur
    game.enemyTurn = false;

    // Terminer le tour du joueur
    game.endPlayerTurn();

    // Vérifier que c'est maintenant le tour des ennemis
    expect(game.enemyTurn).toBe(true);
  });

  test('La méthode endEnemyTurn doit revenir au tour du joueur', () => {
    // Tour initial des ennemis
    game.enemyTurn = true;

    // Terminer le tour des ennemis
    game.endEnemyTurn();

    // Vérifier que c'est maintenant le tour du joueur
    expect(game.enemyTurn).toBe(false);
  });

  test('La méthode checkVictoryCondition doit vérifier si tous les ennemis sont vaincus', () => {
    // Créer des ennemis pour le test
    game.enemies = [
      { active: false },
      { active: false },
      { active: false }
    ];

    // Espionner la méthode nextLevel
    game.gameState.nextLevel = jest.fn();
    game.generateDungeon = jest.fn();
    game.generateEnemies = jest.fn();
    game.placePlayerInStartRoom = jest.fn();

    // Vérifier la condition de victoire
    game.checkVictoryCondition();

    // Vérifier que le niveau a été incrémenté et un nouveau niveau généré
    expect(game.gameState.nextLevel).toHaveBeenCalled();
    expect(game.generateDungeon).toHaveBeenCalled();
    expect(game.generateEnemies).toHaveBeenCalled();
    expect(game.placePlayerInStartRoom).toHaveBeenCalled();
  });

  test('La méthode checkVictoryCondition ne doit rien faire si des ennemis sont encore actifs', () => {
    // Créer des ennemis pour le test
    game.enemies = [
      { active: false },
      { active: true },
      { active: false }
    ];

    // Espionner la méthode nextLevel
    game.gameState.nextLevel = jest.fn();

    // Vérifier la condition de victoire
    game.checkVictoryCondition();

    // Vérifier que le niveau n'a pas été incrémenté
    expect(game.gameState.nextLevel).not.toHaveBeenCalled();
  });
});
