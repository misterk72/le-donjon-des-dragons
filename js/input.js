// Module de gestion des entrées utilisateur
class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false,
            e: false,
            escape: false
        };
        
        // Configurer les écouteurs d'événements pour le clavier
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Configurer les écouteurs d'événements pour les boutons de l'interface
        this.setupButtonListeners();
    }
    
    // Gérer l'appui sur une touche
    handleKeyDown(e) {
        // Empêcher le défilement de la page avec les flèches
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        switch (e.key) {
            case 'ArrowUp':
            case 'z':
            case 'Z':
            case 'w':
            case 'W':
                this.keys.up = true;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.keys.down = true;
                break;
            case 'ArrowLeft':
            case 'q':
            case 'Q':
            case 'a':
            case 'A':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.keys.right = true;
                break;
            case ' ':
                this.keys.space = true;
                break;
            case 'e':
            case 'E':
                this.keys.e = true;
                break;
            case 'Escape':
                this.keys.escape = true;
                this.togglePause();
                break;
        }
    }
    
    // Gérer le relâchement d'une touche
    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'z':
            case 'Z':
            case 'w':
            case 'W':
                this.keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.keys.down = false;
                break;
            case 'ArrowLeft':
            case 'q':
            case 'Q':
            case 'a':
            case 'A':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.keys.right = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
            case 'e':
            case 'E':
                this.keys.e = false;
                break;
            case 'Escape':
                this.keys.escape = false;
                break;
        }
    }
    
    // Configurer les écouteurs d'événements pour les boutons de l'interface
    setupButtonListeners() {
        // Bouton de démarrage du jeu
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => this.game.start());
        }
        
        // Bouton de reprise du jeu
        const resumeButton = document.getElementById('resume-button');
        if (resumeButton) {
            resumeButton.addEventListener('click', () => this.game.resume());
        }
        
        // Bouton de redémarrage du jeu
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.game.restart());
        }
        
        // Bouton pour retourner au menu principal
        const menuButton = document.getElementById('menu-button');
        if (menuButton) {
            menuButton.addEventListener('click', () => {
                this.game.gameState.setState('MENU');
                this.game.ui.showScreen('menu');
            });
        }
        
        // Bouton pour quitter le jeu en pause
        const quitButton = document.getElementById('quit-button');
        if (quitButton) {
            quitButton.addEventListener('click', () => {
                this.game.gameState.setState('MENU');
                this.game.ui.showScreen('menu');
            });
        }
    }
    
    // Basculer entre pause et reprise du jeu
    togglePause() {
        if (this.game.gameState.currentState === 'PLAYING') {
            this.game.pause();
        } else if (this.game.gameState.currentState === 'PAUSED') {
            this.game.resume();
        }
    }
}
