// Classe de la caméra
class Camera {
    constructor(game, width, height) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        
        // Marge pour commencer à déplacer la caméra
        this.margin = 200;
    }
    
    // Suivre le joueur
    follow(target) {
        // Calculer la position centrale de la caméra
        const targetCenterX = target.x + target.width / 2 - this.width / 2;
        const targetCenterY = target.y + target.height / 2 - this.height / 2;
        
        // Mettre à jour la position de la caméra avec un effet de lissage
        this.x += (targetCenterX - this.x) * 0.1;
        this.y += (targetCenterY - this.y) * 0.1;
        
        // S'assurer que la caméra ne sorte pas des limites du monde
        // (à ajuster lorsque nous aurons des niveaux plus grands)
        this.x = Math.max(0, Math.min(this.x, this.game.worldWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, this.game.worldHeight - this.height));
    }
    
    // Transformer les coordonnées du monde en coordonnées de l'écran
    worldToScreen(x, y) {
        return {
            x: x - this.x,
            y: y - this.y
        };
    }
    
    // Vérifier si un objet est visible dans la caméra
    isVisible(object) {
        return (
            object.x + object.width > this.x &&
            object.x < this.x + this.width &&
            object.y + object.height > this.y &&
            object.y < this.y + this.height
        );
    }
}
