// Module de gestion du canvas
class Canvas {
    constructor() {
        // Récupérer l'élément canvas du DOM
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Définir la taille du canvas pour qu'il remplisse la fenêtre
        this.resize();
        
        // Ajouter un écouteur d'événement pour redimensionner le canvas si la fenêtre change de taille
        window.addEventListener('resize', () => this.resize());
    }
    
    // Redimensionner le canvas pour qu'il remplisse la fenêtre
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    // Effacer le contenu du canvas
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Dessiner un rectangle
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    
    // Dessiner un cercle
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Dessiner du texte
    drawText(text, x, y, color, fontSize = '16px', fontFamily = 'Arial') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontSize} ${fontFamily}`;
        this.ctx.fillText(text, x, y);
    }
    
    // Dessiner une image
    drawImage(image, x, y, width, height) {
        this.ctx.drawImage(image, x, y, width, height);
    }
    
    // Dessiner une image avec une animation de sprite
    drawSprite(image, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight) {
        this.ctx.drawImage(
            image,
            srcX, srcY, srcWidth, srcHeight,
            destX, destY, destWidth, destHeight
        );
    }
}
