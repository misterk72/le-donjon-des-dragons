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
        
        // Système de combat
        this.combatSystem = new CombatSystem(this);
        
        // Liste des ennemis
        this.enemies = [];
        
        // Nombre d'ennemis à générer
        this.minEnemies = 3;
        this.maxEnemies = 8;
        
        // Gestion des tours
        this.enemyTurn = false; // false = tour du joueur, true = tour des ennemis
        
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
        
        // Générer les ennemis
        this.generateEnemies();
        
        // Réinitialiser le tour
        this.enemyTurn = false;
        
        // Mettre à jour la caméra pour centrer sur le joueur
        this.camera.follow(this.player);
        
        this.gameState.setState('PLAYING');
        this.ui.hideAllScreens();
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
    
    // Générer les ennemis dans le donjon
    generateEnemies() {
        // Vider la liste des ennemis
        this.enemies = [];
        
        // Placer quelques ennemis fixes pour tester
        // Placer un ennemi de chaque type dans des positions fixes
        
        // Gobelin (type basic)
        const gobelin = new Enemy(this, 5, 5, 'basic');
        this.enemies.push(gobelin);
        console.log('Gobelin placé en position (5, 5)');
        
        // Rat (type fast)
        const rat = new Enemy(this, 7, 7, 'fast');
        this.enemies.push(rat);
        console.log('Rat placé en position (7, 7)');
        
        // Ogre (type tank)
        const ogre = new Enemy(this, 9, 9, 'tank');
        this.enemies.push(ogre);
        console.log('Ogre placé en position (9, 9)');
        
        console.log(`Généré ${this.enemies.length} ennemis dans le donjon`);
    }
    
    // Terminer le tour du joueur et commencer le tour des ennemis
    endPlayerTurn() {
        // Marquer que c'est le tour des ennemis
        this.enemyTurn = true;
        
        // Réinitialiser le mouvement du joueur
        this.player.hasMoved = true;
        
        // Après un court délai, exécuter le tour des ennemis
        setTimeout(() => {
            this.executeEnemyTurn();
        }, 500);
    }
    
    // Exécuter le tour des ennemis
    executeEnemyTurn() {
        // Réinitialiser l'état des ennemis
        for (const enemy of this.enemies) {
            if (enemy.active) {
                enemy.hasMoved = false;
            }
        }
        
        // Laisser les ennemis jouer leur tour pendant un certain temps
        setTimeout(() => {
            // Terminer le tour des ennemis
            this.endEnemyTurn();
        }, 1000);
    }
    
    // Terminer le tour des ennemis et revenir au tour du joueur
    endEnemyTurn() {
        // Marquer que c'est le tour du joueur
        this.enemyTurn = false;
        
        // Réinitialiser le mouvement du joueur
        this.player.hasMoved = false;
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
        if (this.gameState.currentState === 'PLAYING') {
            // Mettre à jour le système de combat
            this.combatSystem.update(deltaTime);
            
            if (this.player) {
                // Mettre à jour le joueur
                this.player.update(deltaTime);
                
                // Mettre à jour la caméra pour suivre le joueur
                this.camera.follow(this.player);
            }
            
            // Mettre à jour les ennemis
            for (const enemy of this.enemies) {
                if (enemy.active) {
                    enemy.update(deltaTime);
                }
            }
            
            // Mettre à jour l'interface utilisateur
            this.ui.updateScore();
            
            // Vérifier si tous les ennemis ont été vaincus
            this.checkVictory();
        }
    }
    
    // Vérifier si tous les ennemis ont été vaincus
    checkVictory() {
        // S'il n'y a pas d'ennemis, ne rien faire
        if (!this.enemies || this.enemies.length === 0) {
            return;
        }
        
        // Vérifier si tous les ennemis sont inactifs
        const allDefeated = this.enemies.every(enemy => !enemy.active);
        
        // Si tous les ennemis sont vaincus, afficher un message de victoire
        if (allDefeated) {
            console.log("Victoire ! Tous les ennemis ont été vaincus !");
            
            // Ajouter un bonus de score pour avoir vaincu tous les ennemis
            this.gameState.addScore(100);
            
            // Mettre à jour l'interface utilisateur
            this.ui.updateScore();
            
            // Générer un nouveau niveau (pour l'instant, juste réinitialiser le niveau actuel)
            // Dans une version future, on pourrait générer un nouveau niveau plus difficile
            this.restart();
        }
    }
    
    // Dessiner les éléments du jeu
    draw() {
        // Sauvegarder le contexte avant de le transformer
        this.canvas.ctx.save();
        
        // Appliquer la transformation de la caméra
        this.canvas.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Dessiner le fond (donjon)
        this.drawBackground();
        
        // Dessiner les ennemis (avec vérification supplémentaire)
        console.log(`Nombre d'ennemis à dessiner: ${this.enemies.length}`);
        if (this.enemies && this.enemies.length > 0) {
            for (let i = 0; i < this.enemies.length; i++) {
                const enemy = this.enemies[i];
                if (enemy && enemy.active) {
                    console.log(`Dessin de l'ennemi ${i} de type ${enemy.type}`);
                    // Dessiner un cercle rouge temporaire pour s'assurer que quelque chose est visible
                    const ctx = this.canvas.ctx;
                    ctx.fillStyle = '#ff0000';
                    ctx.beginPath();
                    ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 20, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Appeler la méthode draw de l'ennemi
                    enemy.draw();
                }
            }
        }
        
        // Dessiner le joueur
        if (this.player) {
            this.player.draw();
        }
        
        // Dessiner les animations d'attaque
        this.combatSystem.drawAttackAnimations();
        
        // Restaurer le contexte
        this.canvas.ctx.restore();
        
        // Dessiner l'indicateur de tour
        this.drawTurnIndicator();
    }
    
    // Dessiner l'indicateur de tour
    drawTurnIndicator() {
        const ctx = this.canvas.ctx;
        const text = this.enemyTurn ? "Tour des ennemis" : "Votre tour";
        const color = this.enemyTurn ? "#e74c3c" : "#2ecc71";
        
        ctx.fillStyle = color;
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(text, this.canvas.canvas.width / 2, 30);
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
