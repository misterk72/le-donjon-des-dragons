// Système de gestion du combat
class CombatSystem {
    constructor(game) {
        this.game = game;
        
        // Indique si le joueur est en combat
        this.inCombat = false;
        
        // Portée d'attaque du joueur (en cases)
        this.attackRange = 1;
        
        // Dégâts de base du joueur
        this.playerBaseDamage = 1;
        
        // Cooldown d'attaque (en millisecondes)
        this.attackCooldown = 500;
        this.lastAttackTime = 0;
        
        // Animations d'attaque
        this.attackAnimations = [];
    }
    
    // Mettre à jour le système de combat
    update(deltaTime) {
        // Mettre à jour les animations d'attaque
        this.updateAttackAnimations(deltaTime);
        
        // Vérifier si le joueur est en combat
        this.checkCombatStatus();
    }
    
    // Vérifier si le joueur est en combat (ennemi à proximité)
    checkCombatStatus() {
        // Si pas d'ennemis actifs, pas en combat
        if (!this.game.enemies || this.game.enemies.length === 0) {
            this.inCombat = false;
            return;
        }
        
        // Vérifier si un ennemi est à proximité
        const player = this.game.player;
        let enemyNearby = false;
        
        for (const enemy of this.game.enemies) {
            if (!enemy.active) continue;
            
            // Calculer la distance entre le joueur et l'ennemi
            const distX = Math.abs(player.gridX - enemy.gridX);
            const distY = Math.abs(player.gridY - enemy.gridY);
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            // Si un ennemi est à proximité, le joueur est en combat
            if (distance <= 5) { // 5 cases de distance
                enemyNearby = true;
                break;
            }
        }
        
        this.inCombat = enemyNearby;
    }
    
    // Attaquer dans la direction du joueur
    playerAttack() {
        // Vérifier le cooldown d'attaque
        const currentTime = performance.now();
        if (currentTime - this.lastAttackTime < this.attackCooldown) {
            return;
        }
        
        // Mettre à jour le temps de la dernière attaque
        this.lastAttackTime = currentTime;
        
        // Récupérer la position du joueur
        const player = this.game.player;
        
        // Déterminer la case cible en fonction de la direction du joueur
        let targetX = player.gridX;
        let targetY = player.gridY;
        
        switch (player.direction) {
            case 0: // Bas
                targetY++;
                break;
            case 1: // Gauche
                targetX--;
                break;
            case 2: // Droite
                targetX++;
                break;
            case 3: // Haut
                targetY--;
                break;
        }
        
        // Vérifier si un ennemi est présent sur la case cible
        let targetEnemy = null;
        for (const enemy of this.game.enemies) {
            if (enemy.active && enemy.gridX === targetX && enemy.gridY === targetY) {
                targetEnemy = enemy;
                break;
            }
        }
        
        // Si un ennemi est trouvé, l'attaquer
        if (targetEnemy) {
            // Calculer les dégâts
            const damage = this.calculatePlayerDamage();
            
            // Infliger les dégâts
            targetEnemy.takeDamage(damage);
            
            // Afficher un message
            console.log(`Le joueur attaque ${targetEnemy.name} et inflige ${damage} dégâts !`);
            
            // Créer une animation d'attaque
            this.createAttackAnimation(player.x, player.y, targetEnemy.x, targetEnemy.y);
            
            // Terminer le tour du joueur
            this.game.endPlayerTurn();
            
            return true;
        }
        
        // Si aucun ennemi n'est trouvé, l'attaque échoue
        console.log("L'attaque n'a touché aucun ennemi.");
        return false;
    }
    
    // Calculer les dégâts infligés par le joueur
    calculatePlayerDamage() {
        // Pour l'instant, dégâts de base
        // Sera étendu plus tard avec des armes, des bonus, etc.
        return this.playerBaseDamage;
    }
    
    // Créer une animation d'attaque
    createAttackAnimation(startX, startY, endX, endY) {
        this.attackAnimations.push({
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            progress: 0,
            duration: 300, // ms
            color: '#ffffff'
        });
    }
    
    // Mettre à jour les animations d'attaque
    updateAttackAnimations(deltaTime) {
        for (let i = this.attackAnimations.length - 1; i >= 0; i--) {
            const anim = this.attackAnimations[i];
            
            // Mettre à jour la progression
            anim.progress += deltaTime * 1000;
            
            // Supprimer l'animation si elle est terminée
            if (anim.progress >= anim.duration) {
                this.attackAnimations.splice(i, 1);
            }
        }
    }
    
    // Dessiner les animations d'attaque
    drawAttackAnimations() {
        const ctx = this.game.canvas.ctx;
        
        for (const anim of this.attackAnimations) {
            // Calculer la progression normalisée (0 à 1)
            const normalizedProgress = anim.progress / anim.duration;
            
            // Calculer la position actuelle
            const currentX = anim.startX + (anim.endX - anim.startX) * normalizedProgress;
            const currentY = anim.startY + (anim.endY - anim.startY) * normalizedProgress;
            
            // Dessiner une ligne d'attaque
            ctx.strokeStyle = anim.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 1 - normalizedProgress; // Fade out
            
            ctx.beginPath();
            ctx.moveTo(anim.startX, anim.startY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            
            // Dessiner un cercle au point d'impact
            const radius = 10 * (1 - normalizedProgress);
            ctx.fillStyle = anim.color;
            ctx.beginPath();
            ctx.arc(currentX, currentY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Réinitialiser l'opacité
            ctx.globalAlpha = 1;
        }
    }
}
