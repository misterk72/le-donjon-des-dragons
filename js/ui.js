// Module de gestion de l'interface utilisateur
class UI {
    constructor(game) {
        this.game = game;
        
        // Éléments de l'interface
        this.screens = {
            menu: document.getElementById('menu'),
            gameOver: document.getElementById('game-over'),
            pauseMenu: document.getElementById('pause-menu')
        };
        
        this.elements = {
            healthBar: document.getElementById('health-fill'),
            score: document.getElementById('score'),
            finalScore: document.getElementById('final-score')
        };
    }
    
    // Initialiser l'interface
    init() {
        // Afficher le menu principal au démarrage
        this.showScreen('menu');
    }
    
    // Afficher un écran spécifique
    showScreen(screenName) {
        // Cacher tous les écrans
        this.hideAllScreens();
        
        // Afficher l'écran demandé
        switch (screenName) {
            case 'menu':
                if (this.screens.menu) this.screens.menu.classList.remove('hidden');
                break;
            case 'game-over':
                if (this.screens.gameOver) this.screens.gameOver.classList.remove('hidden');
                break;
            case 'pause-menu':
                if (this.screens.pauseMenu) this.screens.pauseMenu.classList.remove('hidden');
                break;
            default:
                console.error(`Écran inconnu: ${screenName}`);
        }
    }
    
    // Cacher tous les écrans
    hideAllScreens() {
        if (this.screens.menu) this.screens.menu.classList.add('hidden');
        if (this.screens.gameOver) this.screens.gameOver.classList.add('hidden');
        if (this.screens.pauseMenu) this.screens.pauseMenu.classList.add('hidden');
    }
    
    // Mettre à jour la barre de vie
    updateHealthBar(currentHealth, maxHealth) {
        if (this.elements.healthBar) {
            const healthPercentage = (currentHealth / maxHealth) * 100;
            this.elements.healthBar.style.width = `${healthPercentage}%`;
            
            // Changer la couleur en fonction de la santé
            if (healthPercentage > 50) {
                this.elements.healthBar.style.backgroundColor = '#33ff33'; // Vert
            } else if (healthPercentage > 25) {
                this.elements.healthBar.style.backgroundColor = '#ffff33'; // Jaune
            } else {
                this.elements.healthBar.style.backgroundColor = '#ff3333'; // Rouge
            }
        }
    }
    
    // Mettre à jour le score
    updateScore() {
        if (this.elements.score) {
            this.elements.score.textContent = `Score: ${this.game.gameState.score}`;
        }
    }
    
    // Mettre à jour le score final (écran de game over)
    updateFinalScore() {
        if (this.elements.finalScore) {
            this.elements.finalScore.textContent = this.game.gameState.score;
        }
    }
    
    // Afficher un message temporaire
    showMessage(message, duration = 3000) {
        // Créer un élément de message
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message';
        messageElement.textContent = message;
        
        // Ajouter le message au conteneur du jeu
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(messageElement);
            
            // Supprimer le message après la durée spécifiée
            setTimeout(() => {
                gameContainer.removeChild(messageElement);
            }, duration);
        }
    }
}
