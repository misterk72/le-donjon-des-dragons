// Fichier principal du jeu

class Game {
    constructor() {
        // Initialisation des composants du jeu
        this.canvas = new Canvas();
        this.gameState = new GameState();
        this.input = new InputHandler(this);
        this.ui = new UI(this);
        
        // Taille d'une case de la grille
        this.gridSize = 50;
        
        // Dimensions du monde de jeu en nombre de cases
        this.gridWidth = 20; // 20 cases de large
        this.gridHeight = 15; // 15 cases de haut
        
        // Dimensions du monde de jeu en pixels
        this.worldWidth = this.gridWidth * this.gridSize;
        this.worldHeight = this.gridHeight * this.gridSize;
        
        // Système de collision
        this.collisionSystem = new CollisionSystem(this);
        
        // Générateur de donjon
        this.dungeon = new Dungeon(this);
        
        // Caméra
        this.camera = new Camera(this, this.canvas.canvas.width, this.canvas.canvas.height);
        
        // Joueur (sera placé au point de départ du donjon)
        this.player = null;
        
        // Variables de la boucle de jeu
        this.lastTime = 0;
        this.animationFrameId = null;
        
        // Lier les méthodes au contexte actuel
        this.gameLoop = this.gameLoop.bind(this);
        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.restart = this.restart.bind(this);
        
        // Initialiser l'interface utilisateur
        this.ui.init();
    }
    
    // Démarrer le jeu
    start() {
        // Générer un nouveau donjon
        this.dungeon.generate();
        
        // Définir la taille du monde en fonction de la taille de la grille
        this.worldWidth = this.gridWidth * this.gridSize;
        this.worldHeight = this.gridHeight * this.gridSize;
        
        // Initialiser le joueur au point de départ du donjon
        const startX = this.dungeon.startX * this.gridSize;
        const startY = this.dungeon.startY * this.gridSize;
        this.player = new Player(this, startX, startY);
        
        // Mettre à jour la caméra pour centrer sur le joueur
        this.camera.follow(this.player);
        
        this.gameState.setState('PLAYING');
        this.ui.hideAllScreens();
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
    
    // Mettre le jeu en pause
    pause() {
        if (this.gameState.currentState === 'PLAYING') {
            this.gameState.setState('PAUSED');
            this.ui.showScreen('pause-menu');
            cancelAnimationFrame(this.animationFrameId);
        }
    }
    
    // Reprendre le jeu après une pause
    resume() {
        if (this.gameState.currentState === 'PAUSED') {
            this.gameState.setState('PLAYING');
            this.ui.hideAllScreens();
            this.lastTime = performance.now();
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        }
    }
    
    // Fin de partie
    gameOver() {
        this.gameState.setState('GAME_OVER');
        this.ui.showScreen('game-over');
        this.ui.updateFinalScore();
        cancelAnimationFrame(this.animationFrameId);
    }
    
    // Redémarrer le jeu
    restart() {
        // Réinitialiser les composants du jeu
        this.gameState.reset();
        this.start();
    }
    
    // Boucle principale du jeu
    gameLoop(currentTime) {
        // Calculer le delta time (temps écoulé depuis la dernière frame)
        const deltaTime = (currentTime - this.lastTime) / 1000; // en secondes
        this.lastTime = currentTime;
        
        // Effacer le canvas
        this.canvas.clear();
        
        // Mettre à jour les éléments du jeu
        this.update(deltaTime);
        
        // Dessiner les éléments du jeu
        this.draw();
        
        // Continuer la boucle si le jeu est en cours
        if (this.gameState.currentState === 'PLAYING') {
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        }
    }
    
    // Mettre à jour les éléments du jeu
    update(deltaTime) {
        if (this.player) {
            // Mettre à jour le joueur
            this.player.update(deltaTime);
            
            // Mettre à jour la caméra pour suivre le joueur
            this.camera.follow(this.player);
        }
    }
    
    // Dessiner les éléments du jeu
    draw() {
        // Sauvegarder le contexte avant de le transformer
        this.canvas.ctx.save();
        
        // Appliquer la transformation de la caméra
        this.canvas.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Dessiner le fond (temporaire)
        this.drawBackground();
        
        // Dessiner le joueur
        if (this.player) {
            this.player.draw();
        }
        
        // Restaurer le contexte
        this.canvas.ctx.restore();
    }
    
    // Dessiner le fond du jeu
    drawBackground() {
        // Dessiner le donjon
        this.dungeon.draw();
    }
}

// Initialiser le jeu lorsque la page est chargée
window.addEventListener('load', () => {
    const game = new Game();
});
