// Mock de la classe GameState pour les tests
class GameState {
  constructor() {
    // États possibles du jeu
    this.states = {
      MENU: 'MENU',         // Menu principal
      PLAYING: 'PLAYING',   // Jeu en cours
      PAUSED: 'PAUSED',     // Jeu en pause
      GAME_OVER: 'GAME_OVER' // Fin de partie
    };
    
    // État initial
    this.currentState = this.states.MENU;
    
    // Données du jeu
    this.score = 0;
    this.level = 1;
  }
  
  // Changer l'état du jeu
  setState(state) {
    if (this.states[state]) {
      this.currentState = this.states[state];
      console.log(`État du jeu changé: ${this.currentState}`);
    } else {
      console.error(`État invalide: ${state}`);
    }
  }
  
  // Vérifier l'état actuel
  isState(state) {
    return this.currentState === this.states[state];
  }
  
  // Ajouter des points au score
  addScore(points) {
    this.score += points;
  }
  
  // Passer au niveau suivant
  nextLevel() {
    this.level++;
  }
  
  // Réinitialiser les données du jeu
  reset() {
    this.score = 0;
    this.level = 1;
  }
}

// Tests unitaires pour la classe GameState
describe('GameState', () => {
  let gameState;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Espionner console.log et console.error pour éviter les sorties pendant les tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Créer une instance de GameState pour les tests
    gameState = new GameState();
  });

  afterEach(() => {
    // Restaurer les fonctions originales après chaque test
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('L\'état du jeu doit être initialisé correctement', () => {
    expect(gameState.states).toEqual({
      MENU: 'MENU',
      PLAYING: 'PLAYING',
      PAUSED: 'PAUSED',
      GAME_OVER: 'GAME_OVER'
    });
    expect(gameState.currentState).toBe(gameState.states.MENU);
    expect(gameState.score).toBe(0);
    expect(gameState.level).toBe(1);
  });

  test('La méthode setState doit changer l\'état du jeu', () => {
    // État initial
    expect(gameState.currentState).toBe(gameState.states.MENU);

    // Changer l'état
    gameState.setState('PLAYING');
    expect(gameState.currentState).toBe(gameState.states.PLAYING);
    expect(consoleLogSpy).toHaveBeenCalledWith('État du jeu changé: PLAYING');

    // Changer à nouveau l'état
    gameState.setState('PAUSED');
    expect(gameState.currentState).toBe(gameState.states.PAUSED);
    expect(consoleLogSpy).toHaveBeenCalledWith('État du jeu changé: PAUSED');

    // Essayer de changer vers un état invalide
    gameState.setState('INVALID_STATE');
    expect(consoleErrorSpy).toHaveBeenCalledWith('État invalide: INVALID_STATE');
    expect(gameState.currentState).toBe(gameState.states.PAUSED); // L'état ne change pas
  });

  test('La méthode isState doit vérifier l\'état actuel', () => {
    // État initial
    expect(gameState.isState('MENU')).toBe(true);
    expect(gameState.isState('PLAYING')).toBe(false);

    // Changer l'état
    gameState.setState('PLAYING');
    expect(gameState.isState('MENU')).toBe(false);
    expect(gameState.isState('PLAYING')).toBe(true);
  });

  test('La méthode addScore doit ajouter des points au score', () => {
    // Score initial
    expect(gameState.score).toBe(0);

    // Ajouter des points
    gameState.addScore(10);
    expect(gameState.score).toBe(10);

    // Ajouter encore des points
    gameState.addScore(5);
    expect(gameState.score).toBe(15);
  });

  test('La méthode nextLevel doit incrémenter le niveau', () => {
    // Niveau initial
    expect(gameState.level).toBe(1);

    // Passer au niveau suivant
    gameState.nextLevel();
    expect(gameState.level).toBe(2);

    // Passer encore au niveau suivant
    gameState.nextLevel();
    expect(gameState.level).toBe(3);
  });

  test('La méthode reset doit réinitialiser les données du jeu', () => {
    // Modifier les données
    gameState.score = 100;
    gameState.level = 5;

    // Réinitialiser
    gameState.reset();

    // Vérifier que les données ont été réinitialisées
    expect(gameState.score).toBe(0);
    expect(gameState.level).toBe(1);
  });
});
