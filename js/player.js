// Classe du joueur
class Player {
    constructor(game, x, y) {
        this.game = game;
        
        // Taille du joueur
        this.width = 40;
        this.height = 40;
        
        // Taille d'une case de la grille
        this.gridSize = 50;
        
        // Position en coordonnées de la grille
        this.gridX = Math.floor(x / this.gridSize);
        this.gridY = Math.floor(y / this.gridSize);
        
        // Position réelle en pixels (pour l'affichage)
        this.x = this.gridX * this.gridSize + (this.gridSize - this.width) / 2;
        this.y = this.gridY * this.gridSize + (this.gridSize - this.height) / 2;
        
        // Attributs du joueur
        this.health = 100;
        this.maxHealth = 100;
        this.color = '#ff5500'; // Couleur vive pour le joueur (orange)
        
        // Variables pour l'animation
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 3;
        this.fps = 10;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        
        // Direction du joueur (0: bas, 1: gauche, 2: droite, 3: haut)
        this.direction = 0;
        
        // Variables pour le déplacement en tour par tour
        this.isMoving = false;
        this.targetX = this.x;
        this.targetY = this.y;
        this.moveSpeed = 5; // Vitesse de l'animation de déplacement
        
        // Indique si le joueur a joué son tour
        this.hasMoved = false;
    }
    
    // Mettre à jour la position et l'état du joueur
    update(deltaTime) {
        // Gestion du déplacement
        this.move(deltaTime);
        
        // Mise à jour de l'animation
        this.updateAnimation(deltaTime);
        
        // Mise à jour de l'interface utilisateur
        this.updateUI();
    }
    
    // Gérer le déplacement du joueur en tour par tour
    move(deltaTime) {
        // Si le joueur est déjà en train de se déplacer, continuer l'animation
        if (this.isMoving) {
            this.animateMovement(deltaTime);
            return;
        }
        
        // Si le joueur a déjà joué son tour, ne rien faire
        if (this.hasMoved) {
            return;
        }
        
        // Variables pour stocker la nouvelle position sur la grille
        let newGridX = this.gridX;
        let newGridY = this.gridY;
        let hasMoved = false;
        
        // Déplacement sur la grille
        if (this.game.input.keys.left) {
            newGridX--;
            this.direction = 1; // Gauche
            hasMoved = true;
        } else if (this.game.input.keys.right) {
            newGridX++;
            this.direction = 2; // Droite
            hasMoved = true;
        } else if (this.game.input.keys.up) {
            newGridY--;
            this.direction = 3; // Haut
            hasMoved = true;
        } else if (this.game.input.keys.down) {
            newGridY++;
            this.direction = 0; // Bas
            hasMoved = true;
        }
        
        // Si une touche de déplacement a été pressée
        if (hasMoved) {
            // Vérifier si la nouvelle position est valide
            if (!this.checkCollision(newGridX, newGridY)) {
                // Définir la nouvelle position sur la grille
                this.gridX = newGridX;
                this.gridY = newGridY;
                
                // Calculer la position cible en pixels
                this.targetX = this.gridX * this.gridSize + (this.gridSize - this.width) / 2;
                this.targetY = this.gridY * this.gridSize + (this.gridSize - this.height) / 2;
                
                // Démarrer l'animation de déplacement
                this.isMoving = true;
                
                // Marquer que le joueur a joué son tour
                this.hasMoved = true;
                
                // Après un délai, permettre au joueur de jouer à nouveau
                setTimeout(() => {
                    this.hasMoved = false;
                }, 200); // Délai court pour éviter les déplacements trop rapides
            }
        }
    }
    
    // Animer le déplacement du joueur vers la position cible
    animateMovement(deltaTime) {
        // Calculer la distance à parcourir pour cette frame
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si le joueur est proche de la cible, arrêter l'animation
        if (distance < this.moveSpeed) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
            return;
        }
        
        // Déplacer le joueur vers la cible
        const moveX = (dx / distance) * this.moveSpeed;
        const moveY = (dy / distance) * this.moveSpeed;
        
        this.x += moveX;
        this.y += moveY;
    }
    
    // Vérifier les collisions avec les murs et obstacles
    checkCollision(gridX, gridY) {
        // Vérifier si la position est en dehors des limites du monde
        if (gridX < 0 || gridY < 0 || 
            gridX >= this.game.worldWidth / this.gridSize || 
            gridY >= this.game.worldHeight / this.gridSize) {
            return true;
        }
        
        // Vérifier si la position est un mur dans le donjon
        if (this.game.dungeon.isWall(gridX, gridY)) {
            return true;
        }
        
        // Vérifier si c'est une porte (les portes sont traversables)
        if (this.game.dungeon.isDoor(gridX, gridY)) {
            // Jouer une animation ou un son d'ouverture de porte (futur)
            return false; // Les portes sont traversables
        }
        
        return false;
    }
    
    // Mettre à jour l'animation du joueur
    updateAnimation(deltaTime) {
        // Mettre à jour le timer d'animation
        this.frameTimer += deltaTime * 1000;
        
        // Changer de frame si le timer dépasse l'intervalle
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            
            // Passer à la frame suivante
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
        }
        
        // Mettre à jour la ligne de sprite en fonction de la direction
        this.frameY = this.direction;
    }
    
    // Mettre à jour l'interface utilisateur
    updateUI() {
        // Mettre à jour la barre de vie
        if (this.game.ui && this.game.ui.elements.healthBar) {
            this.game.ui.updateHealthBar(this.health, this.maxHealth);
        }
    }
    
    // Dessiner le joueur
    draw() {
        const ctx = this.game.canvas.ctx;
        
        // Dessiner un cercle pour le corps du joueur
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Ajouter une bordure au joueur pour le rendre plus visible
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Dessiner une flèche pour indiquer la direction
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        
        switch (this.direction) {
            case 0: // Bas
                ctx.moveTo(this.x + this.width / 2, this.y + this.height);
                ctx.lineTo(this.x + this.width / 2 - 5, this.y + this.height - 10);
                ctx.lineTo(this.x + this.width / 2 + 5, this.y + this.height - 10);
                break;
            case 1: // Gauche
                ctx.moveTo(this.x, this.y + this.height / 2);
                ctx.lineTo(this.x + 10, this.y + this.height / 2 - 5);
                ctx.lineTo(this.x + 10, this.y + this.height / 2 + 5);
                break;
            case 2: // Droite
                ctx.moveTo(this.x + this.width, this.y + this.height / 2);
                ctx.lineTo(this.x + this.width - 10, this.y + this.height / 2 - 5);
                ctx.lineTo(this.x + this.width - 10, this.y + this.height / 2 + 5);
                break;
            case 3: // Haut
                ctx.moveTo(this.x + this.width / 2, this.y);
                ctx.lineTo(this.x + this.width / 2 - 5, this.y + 10);
                ctx.lineTo(this.x + this.width / 2 + 5, this.y + 10);
                break;
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    // Infliger des dégâts au joueur
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // Mettre à jour l'interface utilisateur
        this.updateUI();
        
        // Vérifier si le joueur est mort
        if (this.health <= 0) {
            this.die();
        }
    }
    
    // Soigner le joueur
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        // Mettre à jour l'interface utilisateur
        this.updateUI();
    }
    
    // Gérer la mort du joueur
    die() {
        // Déclencher la fin de partie
        this.game.gameOver();
    }
}
