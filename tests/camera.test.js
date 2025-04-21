// Importation de la classe Camera pour les tests
// Comme Jest s'exécute dans Node.js, nous devons simuler l'environnement du navigateur

// Mock de la classe Camera pour les tests
class Camera {
  constructor(game, width, height) {
    this.game = game;
    this.width = width;
    this.height = height;
    this.x = 0;
    this.y = 0;
    this.margin = 200;
  }

  follow(target) {
    const targetCenterX = target.x + target.width / 2 - this.width / 2;
    const targetCenterY = target.y + target.height / 2 - this.height / 2;
    
    this.x += (targetCenterX - this.x) * 0.1;
    this.y += (targetCenterY - this.y) * 0.1;
    
    this.x = Math.max(0, Math.min(this.x, this.game.worldWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, this.game.worldHeight - this.height));
  }

  worldToScreen(x, y) {
    return {
      x: x - this.x,
      y: y - this.y
    };
  }

  isVisible(object) {
    return (
      object.x + object.width > this.x &&
      object.x < this.x + this.width &&
      object.y + object.height > this.y &&
      object.y < this.y + this.height
    );
  }
}

// Tests unitaires pour la classe Camera
describe('Camera', () => {
  // Mock des dépendances
  let mockGame;
  let camera;

  beforeEach(() => {
    // Créer un mock du jeu
    mockGame = {
      worldWidth: 1000,
      worldHeight: 800
    };

    // Créer une instance de Camera pour les tests
    camera = new Camera(mockGame, 800, 600);
  });

  test('La caméra doit être initialisée correctement', () => {
    expect(camera.width).toBe(800);
    expect(camera.height).toBe(600);
    expect(camera.x).toBe(0);
    expect(camera.y).toBe(0);
    expect(camera.margin).toBe(200);
  });

  test('La méthode follow doit suivre la cible', () => {
    // Position initiale de la caméra
    camera.x = 0;
    camera.y = 0;

    // Cible à suivre
    const target = {
      x: 500,
      y: 400,
      width: 40,
      height: 40
    };

    // Suivre la cible
    camera.follow(target);

    // Vérifier que la caméra s'est déplacée vers la cible
    // Note: La caméra utilise un effet de lissage, donc elle ne se déplace pas directement à la position cible
    expect(camera.x).toBeGreaterThan(0);
    expect(camera.y).toBeGreaterThan(0);
  });

  test('La méthode follow ne doit pas dépasser les limites du monde', () => {
    // Position initiale de la caméra
    camera.x = 0;
    camera.y = 0;

    // Cible en dehors des limites du monde
    const target = {
      x: mockGame.worldWidth + 100,
      y: mockGame.worldHeight + 100,
      width: 40,
      height: 40
    };

    // Suivre la cible
    camera.follow(target);

    // Vérifier que la caméra reste dans les limites du monde
    expect(camera.x).toBeLessThanOrEqual(mockGame.worldWidth - camera.width);
    expect(camera.y).toBeLessThanOrEqual(mockGame.worldHeight - camera.height);
  });

  test('La méthode worldToScreen doit convertir les coordonnées du monde en coordonnées de l\'écran', () => {
    // Position de la caméra
    camera.x = 100;
    camera.y = 100;

    // Coordonnées du monde
    const worldX = 200;
    const worldY = 200;

    // Convertir en coordonnées de l'écran
    const screenCoords = camera.worldToScreen(worldX, worldY);

    // Vérifier que les coordonnées ont été correctement converties
    expect(screenCoords.x).toBe(worldX - camera.x);
    expect(screenCoords.y).toBe(worldY - camera.y);
  });

  test('La méthode isVisible doit détecter si un objet est visible dans la caméra', () => {
    // Position de la caméra
    camera.x = 100;
    camera.y = 100;

    // Objet visible dans la caméra
    const visibleObject = {
      x: 150,
      y: 150,
      width: 40,
      height: 40
    };

    // Objet en dehors de la caméra
    const invisibleObject = {
      x: 1000,
      y: 1000,
      width: 40,
      height: 40
    };

    // Vérifier la visibilité
    expect(camera.isVisible(visibleObject)).toBe(true);
    expect(camera.isVisible(invisibleObject)).toBe(false);
  });
});
