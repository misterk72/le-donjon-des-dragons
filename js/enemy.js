// Classe de base pour les ennemis
class Enemy {
    constructor(game, gridX, gridY, type = 'basic') {
        this.game = game;
        
        // Position sur la grille
        this.gridX = gridX;
        this.gridY = gridY;
        
        // Taille de l'ennemi
        this.width = 30;
        this.height = 30;
        
        // Taille d'une case de la grille
        this.gridSize = this.game.gridSize;
        
        // Position réelle en pixels (pour l'affichage)
        this.x = this.gridX * this.gridSize + (this.gridSize - this.width) / 2;
        this.y = this.gridY * this.gridSize + (this.gridSize - this.height) / 2;
        
        // Type d'ennemi
        this.type = type;
        
        // Attributs de base
        this.setAttributes();
        
        // Variables pour l'animation
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 3;
        this.fps = 5;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        
        // Direction de l'ennemi (0: bas, 1: gauche, 2: droite, 3: haut)
        this.direction = Math.floor(Math.random() * 4);
        
        // Variables pour le déplacement en tour par tour
        this.isMoving = false;
        this.targetX = this.x;
        this.targetY = this.y;
        this.moveSpeed = 3; // Plus lent que le joueur
        
        // Indique si l'ennemi a joué son tour
        this.hasMoved = false;
        
        // Portée de détection du joueur (en cases)
        this.detectionRange = 5;
        
        // Indique si l'ennemi est actif
        this.active = true;
    }
    
    // Définir les attributs en fonction du type d'ennemi
    setAttributes() {
        switch (this.type) {
            case 'basic':
                this.health = 3;
                this.maxHealth = 3;
                this.damage = 1;
                this.color = '#e74c3c'; // Rouge
                this.name = 'Gobelin';
                break;
            case 'fast':
                this.health = 2;
                this.maxHealth = 2;
                this.damage = 1;
                this.color = '#f39c12'; // Orange
                this.moveSpeed = 4; // Plus rapide
                this.name = 'Rat';
                break;
            case 'tank':
                this.health = 5;
                this.maxHealth = 5;
                this.damage = 2;
                this.color = '#8e44ad'; // Violet
                this.moveSpeed = 2; // Plus lent
                this.name = 'Ogre';
                break;
            default:
                this.health = 3;
                this.maxHealth = 3;
                this.damage = 1;
                this.color = '#e74c3c'; // Rouge
                this.name = 'Monstre';
        }
    }
    
    // Mettre à jour l'ennemi
    update(deltaTime) {
        // Si l'ennemi n'est pas actif, ne rien faire
        if (!this.active) return;
        
        // Si c'est le tour du joueur, ne rien faire
        if (!this.game.enemyTurn) return;
        
        // Si l'ennemi est déjà en train de se déplacer, continuer l'animation
        if (this.isMoving) {
            this.animateMovement(deltaTime);
            return;
        }
        
        // Si l'ennemi a déjà joué son tour, ne rien faire
        if (this.hasMoved) {
            return;
        }
        
        // Décider de l'action à effectuer
        this.decideAction();
        
        // Mise à jour de l'animation
        this.updateAnimation(deltaTime);
    }
    
    // Décider de l'action à effectuer
    decideAction() {
        // Calculer la distance au joueur
        const distX = this.gridX - this.game.player.gridX;
        const distY = this.gridY - this.game.player.gridY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Si le joueur est adjacent, attaquer
        if (distance <= 1) {
            this.attack();
        } 
        // Si le joueur est à portée de détection, se déplacer vers lui
        else if (distance <= this.detectionRange) {
            this.moveTowardsPlayer();
        } 
        // Sinon, se déplacer aléatoirement
        else {
            this.moveRandomly();
        }
        
        // Marquer que l'ennemi a joué son tour
        this.hasMoved = true;
    }
    
    // Attaquer le joueur
    attack() {
        // Infliger des dégâts au joueur
        this.game.player.takeDamage(this.damage);
        
        // Afficher un message
        console.log(`${this.name} attaque le joueur et inflige ${this.damage} dégâts !`);
        
        // Changer la direction pour faire face au joueur
        if (this.gridX < this.game.player.gridX) {
            this.direction = 2; // Droite
        } else if (this.gridX > this.game.player.gridX) {
            this.direction = 1; // Gauche
        } else if (this.gridY < this.game.player.gridY) {
            this.direction = 0; // Bas
        } else {
            this.direction = 3; // Haut
        }
    }
    
    // Se déplacer vers le joueur
    moveTowardsPlayer() {
        // Calculer la direction vers le joueur
        const distX = this.game.player.gridX - this.gridX;
        const distY = this.game.player.gridY - this.gridY;
        
        // Déterminer la direction principale (horizontale ou verticale)
        const moveHorizontal = Math.abs(distX) > Math.abs(distY);
        
        let newGridX = this.gridX;
        let newGridY = this.gridY;
        
        if (moveHorizontal) {
            // Se déplacer horizontalement
            if (distX > 0) {
                newGridX++;
                this.direction = 2; // Droite
            } else {
                newGridX--;
                this.direction = 1; // Gauche
            }
        } else {
            // Se déplacer verticalement
            if (distY > 0) {
                newGridY++;
                this.direction = 0; // Bas
            } else {
                newGridY--;
                this.direction = 3; // Haut
            }
        }
        
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
        }
    }
    
    // Se déplacer aléatoirement
    moveRandomly() {
        // 50% de chance de ne pas bouger
        if (Math.random() < 0.5) {
            return;
        }
        
        // Choisir une direction aléatoire
        const directions = [
            { dx: 0, dy: 1, dir: 0 }, // Bas
            { dx: -1, dy: 0, dir: 1 }, // Gauche
            { dx: 1, dy: 0, dir: 2 }, // Droite
            { dx: 0, dy: -1, dir: 3 }  // Haut
        ];
        
        // Mélanger les directions
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        // Essayer chaque direction jusqu'à en trouver une valide
        for (const dir of directions) {
            const newGridX = this.gridX + dir.dx;
            const newGridY = this.gridY + dir.dy;
            
            // Vérifier si la nouvelle position est valide
            if (!this.checkCollision(newGridX, newGridY)) {
                // Définir la nouvelle position sur la grille
                this.gridX = newGridX;
                this.gridY = newGridY;
                this.direction = dir.dir;
                
                // Calculer la position cible en pixels
                this.targetX = this.gridX * this.gridSize + (this.gridSize - this.width) / 2;
                this.targetY = this.gridY * this.gridSize + (this.gridSize - this.height) / 2;
                
                // Démarrer l'animation de déplacement
                this.isMoving = true;
                
                // Sortir de la boucle
                break;
            }
        }
    }
    
    // Animer le déplacement de l'ennemi vers la position cible
    animateMovement(deltaTime) {
        // Calculer la distance à parcourir pour cette frame
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si l'ennemi est proche de la cible, arrêter l'animation
        if (distance < this.moveSpeed) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMoving = false;
            return;
        }
        
        // Déplacer l'ennemi vers la cible
        const moveX = (dx / distance) * this.moveSpeed;
        const moveY = (dy / distance) * this.moveSpeed;
        
        this.x += moveX;
        this.y += moveY;
    }
    
    // Vérifier les collisions avec les murs, les autres ennemis et le joueur
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
        
        // Vérifier si la position est occupée par le joueur
        if (gridX === this.game.player.gridX && gridY === this.game.player.gridY) {
            return true;
        }
        
        // Vérifier si la position est occupée par un autre ennemi
        for (const enemy of this.game.enemies) {
            if (enemy !== this && enemy.active && enemy.gridX === gridX && enemy.gridY === gridY) {
                return true;
            }
        }
        
        return false;
    }
    
    // Mettre à jour l'animation de l'ennemi
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
    
    // Dessiner l'ennemi
    draw() {
        if (!this.active) return; // Ne pas dessiner si inactif
        
        console.log(`Dessin de l'ennemi en position (${this.x}, ${this.y})`);
        
        const ctx = this.game.canvas.ctx;
        
        // Dessiner un cercle pour le corps de l'ennemi
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Ajouter une bordure à l'ennemi
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Dessiner une flèche pour indiquer la direction
        ctx.fillStyle = '#000000';
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
        
        // Afficher la barre de vie au-dessus de l'ennemi
        this.drawHealthBar(ctx);
    }
    
    // Dessiner la barre de vie de l'ennemi
    drawHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 10;
        
        // Fond de la barre de vie
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Barre de vie
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = healthPercentage > 0.5 ? '#2ecc71' : healthPercentage > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    }
    
    // Infliger des dégâts à l'ennemi
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // Vérifier si l'ennemi est mort
        if (this.health <= 0) {
            this.die();
        }
    }
    
    // Gérer la mort de l'ennemi
    die() {
        console.log(`${this.name} est vaincu !`);
        
        // Désactiver l'ennemi
        this.active = false;
        
        // Ajouter des points au score
        this.game.gameState.addScore(this.type === 'basic' ? 10 : this.type === 'fast' ? 15 : 20);
        
        // Mettre à jour l'interface utilisateur
        this.game.ui.updateScore();
    }
}
