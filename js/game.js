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
        
        // Caméra
        this.camera = new Camera(this, this.canvas.canvas.width, this.canvas.canvas.height);
        
        // Joueur (centré sur l'écran au départ)
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
        // Initialiser ou réinitialiser le joueur au centre de la grille
        const centerGridX = Math.floor(this.gridWidth / 2);
        const centerGridY = Math.floor(this.gridHeight / 2);
        const centerX = centerGridX * this.gridSize;
        const centerY = centerGridY * this.gridSize;
        this.player = new Player(this, centerX, centerY);
        
        // Définir la taille du monde en fonction de la taille du canvas
        this.worldWidth = this.gridWidth * this.gridSize;
        this.worldHeight = this.gridHeight * this.gridSize;
        
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
        // Dessiner une grille pour le jeu en tour par tour
        const ctx = this.canvas.ctx;
        
        // Dessiner les cases de la grille en alternant les couleurs
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                // Alterner les couleurs pour créer un effet de damier
                if ((x + y) % 2 === 0) {
                    ctx.fillStyle = '#1a1a1a'; // Cases foncées
                } else {
                    ctx.fillStyle = '#2a2a2a'; // Cases plus claires
                }
                
                // Dessiner la case
                ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
            }
        }
        
        // Dessiner les lignes de la grille
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        
        // Dessiner les lignes verticales
        for (let x = 0; x <= this.worldWidth; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.worldHeight);
            ctx.stroke();
        }
        
        // Dessiner les lignes horizontales
        for (let y = 0; y <= this.worldHeight; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.worldWidth, y);
            ctx.stroke();
        }
    }
}

// Initialiser le jeu lorsque la page est chargée
window.addEventListener('load', () => {
    const game = new Game();
});
