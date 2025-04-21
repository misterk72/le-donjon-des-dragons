// Fichier principal du jeu

class Game {
    constructor() {
        // Initialisation des composants du jeu
        this.canvas = new Canvas();
        this.gameState = new GameState();
        this.input = new InputHandler(this);
        this.ui = new UI(this);
        
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
        // Cette méthode sera étendue avec la logique du jeu
        // Pour l'instant, elle est vide car nous n'avons pas encore implémenté
        // les systèmes de jeu comme le joueur, les ennemis, etc.
    }
    
    // Dessiner les éléments du jeu
    draw() {
        // Cette méthode sera étendue avec le rendu des éléments du jeu
        // Pour l'instant, elle est vide car nous n'avons pas encore implémenté
        // les systèmes de jeu comme le joueur, les ennemis, etc.
    }
}

// Initialiser le jeu lorsque la page est chargée
window.addEventListener('load', () => {
    const game = new Game();
});
