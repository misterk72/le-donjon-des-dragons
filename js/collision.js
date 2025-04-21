// Système de gestion des collisions
class CollisionSystem {
    constructor(game) {
        this.game = game;
        this.obstacles = []; // Liste des obstacles dans le niveau
    }
    
    // Ajouter un obstacle à la liste
    addObstacle(obstacle) {
        this.obstacles.push(obstacle);
    }
    
    // Vider la liste des obstacles
    clearObstacles() {
        this.obstacles = [];
    }
    
    // Vérifier la collision entre deux rectangles
    checkRectCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
    
    // Vérifier la collision entre un point et un rectangle
    checkPointCollision(point, rect) {
        return (
            point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height
        );
    }
    
    // Vérifier la collision entre un objet et tous les obstacles
    checkObstacleCollision(object) {
        for (const obstacle of this.obstacles) {
            if (this.checkRectCollision(object, obstacle)) {
                return true;
            }
        }
        return false;
    }
    
    // Résoudre la collision entre un objet et les obstacles
    resolveCollision(object, newX, newY) {
        // Créer un objet temporaire pour tester la position horizontale
        const tempHorizontal = {
            x: newX,
            y: object.y,
            width: object.width,
            height: object.height
        };
        
        // Créer un objet temporaire pour tester la position verticale
        const tempVertical = {
            x: object.x,
            y: newY,
            width: object.width,
            height: object.height
        };
        
        // Vérifier les collisions horizontales et verticales séparément
        const horizontalCollision = this.checkObstacleCollision(tempHorizontal);
        const verticalCollision = this.checkObstacleCollision(tempVertical);
        
        // Retourner les résultats
        return {
            x: horizontalCollision ? object.x : newX,
            y: verticalCollision ? object.y : newY,
            collided: horizontalCollision || verticalCollision
        };
    }
}
