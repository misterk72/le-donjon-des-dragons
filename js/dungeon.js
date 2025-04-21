// Classe de génération du donjon
class Dungeon {
    constructor(game) {
        this.game = game;
        
        // Paramètres du donjon
        this.minRooms = 5;
        this.maxRooms = 10;
        this.minRoomSize = 3;
        this.maxRoomSize = 6;
        
        // Grille du donjon (0: vide, 1: mur, 2: sol, 3: porte)
        this.grid = [];
        
        // Liste des salles
        this.rooms = [];
        
        // Position de départ du joueur
        this.startX = 0;
        this.startY = 0;
    }
    
    // Générer un nouveau donjon
    generate() {
        console.log("Génération d'un nouveau donjon...");
        
        // Réinitialiser la grille
        this.initializeGrid();
        
        // Générer les salles
        this.generateRooms();
        
        // Connecter les salles avec des couloirs
        this.connectRooms();
        
        // Placer les portes
        this.placeDoors();
        
        // Définir la position de départ du joueur
        this.setStartPosition();
        
        // Ajouter les obstacles à la liste de collisions
        this.addObstaclesToCollisionSystem();
        
        console.log("Donjon généré avec " + this.rooms.length + " salles");
        return this.grid;
    }
    
    // Initialiser la grille avec des murs partout
    initializeGrid() {
        this.grid = [];
        this.rooms = [];
        
        // Remplir la grille de murs
        for (let y = 0; y < this.game.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.game.gridWidth; x++) {
                this.grid[y][x] = 1; // 1 = mur
            }
        }
    }
    
    // Générer les salles aléatoirement
    generateRooms() {
        // Déterminer le nombre de salles à générer
        const numRooms = Math.floor(Math.random() * (this.maxRooms - this.minRooms + 1)) + this.minRooms;
        
        // Tentatives maximales pour placer une salle
        const maxAttempts = 100;
        
        // Générer les salles
        for (let i = 0; i < numRooms; i++) {
            let roomPlaced = false;
            let attempts = 0;
            
            while (!roomPlaced && attempts < maxAttempts) {
                // Générer une taille aléatoire pour la salle
                const width = Math.floor(Math.random() * (this.maxRoomSize - this.minRoomSize + 1)) + this.minRoomSize;
                const height = Math.floor(Math.random() * (this.maxRoomSize - this.minRoomSize + 1)) + this.minRoomSize;
                
                // Générer une position aléatoire pour la salle
                const x = Math.floor(Math.random() * (this.game.gridWidth - width - 2)) + 1;
                const y = Math.floor(Math.random() * (this.game.gridHeight - height - 2)) + 1;
                
                // Vérifier si la salle peut être placée ici
                if (this.canPlaceRoom(x, y, width, height)) {
                    // Placer la salle
                    this.placeRoom(x, y, width, height);
                    
                    // Ajouter la salle à la liste
                    this.rooms.push({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        centerX: Math.floor(x + width / 2),
                        centerY: Math.floor(y + height / 2)
                    });
                    
                    roomPlaced = true;
                }
                
                attempts++;
            }
        }
    }
    
    // Vérifier si une salle peut être placée à une position donnée
    canPlaceRoom(x, y, width, height) {
        // Vérifier si la salle dépasse les limites de la grille
        if (x < 1 || y < 1 || x + width > this.game.gridWidth - 1 || y + height > this.game.gridHeight - 1) {
            return false;
        }
        
        // Vérifier si la salle chevauche une autre salle (avec une marge de 1)
        for (let j = y - 1; j < y + height + 1; j++) {
            for (let i = x - 1; i < x + width + 1; i++) {
                if (j >= 0 && j < this.game.gridHeight && i >= 0 && i < this.game.gridWidth) {
                    if (this.grid[j][i] === 2) { // 2 = sol (salle existante)
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    // Placer une salle dans la grille
    placeRoom(x, y, width, height) {
        for (let j = y; j < y + height; j++) {
            for (let i = x; i < x + width; i++) {
                this.grid[j][i] = 2; // 2 = sol
            }
        }
    }
    
    // Connecter les salles avec des couloirs
    connectRooms() {
        // Si pas de salles, ne rien faire
        if (this.rooms.length === 0) {
            return;
        }
        
        // Trier les salles par distance au centre de la première salle
        const sortedRooms = [...this.rooms];
        sortedRooms.sort((a, b) => {
            const distA = Math.pow(a.centerX - this.rooms[0].centerX, 2) + Math.pow(a.centerY - this.rooms[0].centerY, 2);
            const distB = Math.pow(b.centerX - this.rooms[0].centerX, 2) + Math.pow(b.centerY - this.rooms[0].centerY, 2);
            return distA - distB;
        });
        
        // Connecter chaque salle à la salle suivante dans la liste triée
        for (let i = 0; i < sortedRooms.length - 1; i++) {
            this.createCorridor(sortedRooms[i].centerX, sortedRooms[i].centerY, sortedRooms[i+1].centerX, sortedRooms[i+1].centerY);
        }
    }
    
    // Créer un couloir entre deux points
    createCorridor(x1, y1, x2, y2) {
        // Déterminer la direction du couloir (horizontal puis vertical ou vice versa)
        const horizontal = Math.random() >= 0.5;
        
        if (horizontal) {
            // D'abord horizontal, puis vertical
            this.createHorizontalCorridor(x1, x2, y1);
            this.createVerticalCorridor(y1, y2, x2);
        } else {
            // D'abord vertical, puis horizontal
            this.createVerticalCorridor(y1, y2, x1);
            this.createHorizontalCorridor(x1, x2, y2);
        }
    }
    
    // Créer un couloir horizontal
    createHorizontalCorridor(x1, x2, y) {
        const start = Math.min(x1, x2);
        const end = Math.max(x1, x2);
        
        for (let x = start; x <= end; x++) {
            if (this.grid[y][x] === 1) { // Si c'est un mur
                this.grid[y][x] = 2; // Le transformer en sol
            }
        }
    }
    
    // Créer un couloir vertical
    createVerticalCorridor(y1, y2, x) {
        const start = Math.min(y1, y2);
        const end = Math.max(y1, y2);
        
        for (let y = start; y <= end; y++) {
            if (this.grid[y][x] === 1) { // Si c'est un mur
                this.grid[y][x] = 2; // Le transformer en sol
            }
        }
    }
    
    // Placer les portes entre les salles et les couloirs
    placeDoors() {
        // Parcourir la grille pour trouver les emplacements potentiels de portes
        for (let y = 1; y < this.game.gridHeight - 1; y++) {
            for (let x = 1; x < this.game.gridWidth - 1; x++) {
                // Vérifier si c'est un sol
                if (this.grid[y][x] === 2) {
                    // Vérifier si c'est un emplacement potentiel de porte
                    // Une porte potentielle a un mur de chaque côté (horizontal ou vertical)
                    const isHorizontalDoor = this.grid[y][x-1] === 1 && this.grid[y][x+1] === 1 &&
                                           this.grid[y-1][x] === 2 && this.grid[y+1][x] === 2;
                    
                    const isVerticalDoor = this.grid[y-1][x] === 1 && this.grid[y+1][x] === 1 &&
                                         this.grid[y][x-1] === 2 && this.grid[y][x+1] === 2;
                    
                    // Si c'est un emplacement potentiel de porte et avec une probabilité de 30%
                    if ((isHorizontalDoor || isVerticalDoor) && Math.random() < 0.3) {
                        // Placer une porte
                        this.grid[y][x] = 3; // 3 = porte
                    }
                }
            }
        }
    }
    
    // Définir la position de départ du joueur
    setStartPosition() {
        // Si aucune salle n'a été générée, position par défaut
        if (this.rooms.length === 0) {
            this.startX = Math.floor(this.game.gridWidth / 2);
            this.startY = Math.floor(this.game.gridHeight / 2);
            return;
        }
        
        // Placer le joueur au centre de la première salle
        const startRoom = this.rooms[0];
        this.startX = startRoom.centerX;
        this.startY = startRoom.centerY;
    }
    
    // Ajouter les obstacles (murs) au système de collision
    addObstaclesToCollisionSystem() {
        // Vider la liste des obstacles
        this.game.collisionSystem.clearObstacles();
        
        // Parcourir la grille et ajouter les murs au système de collision
        for (let y = 0; y < this.game.gridHeight; y++) {
            for (let x = 0; x < this.game.gridWidth; x++) {
                if (this.grid[y][x] === 1) { // Si c'est un mur
                    // Ajouter un obstacle à cette position
                    this.game.collisionSystem.addObstacle({
                        x: x * this.game.gridSize,
                        y: y * this.game.gridSize,
                        width: this.game.gridSize,
                        height: this.game.gridSize
                    });
                }
            }
        }
    }
    
    // Dessiner le donjon
    draw() {
        const ctx = this.game.canvas.ctx;
        
        // Parcourir la grille et dessiner les éléments
        for (let y = 0; y < this.game.gridHeight; y++) {
            for (let x = 0; x < this.game.gridWidth; x++) {
                const cellX = x * this.game.gridSize;
                const cellY = y * this.game.gridSize;
                
                switch (this.grid[y][x]) {
                    case 0: // Vide (non utilisé pour l'instant)
                        ctx.fillStyle = '#000000';
                        break;
                    case 1: // Mur
                        ctx.fillStyle = '#555555';
                        break;
                    case 2: // Sol
                        ctx.fillStyle = '#222222';
                        break;
                    case 3: // Porte
                        ctx.fillStyle = '#8B4513'; // Marron
                        break;
                    default:
                        ctx.fillStyle = '#000000';
                }
                
                // Dessiner la cellule
                ctx.fillRect(cellX, cellY, this.game.gridSize, this.game.gridSize);
                
                // Ajouter une bordure pour les murs
                if (this.grid[y][x] === 1) {
                    ctx.strokeStyle = '#666666';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(cellX, cellY, this.game.gridSize, this.game.gridSize);
                }
            }
        }
    }
    
    // Vérifier si une position est un mur
    isWall(gridX, gridY) {
        // Vérifier si la position est en dehors de la grille
        if (gridX < 0 || gridY < 0 || gridX >= this.game.gridWidth || gridY >= this.game.gridHeight) {
            return true;
        }
        
        // Vérifier si la cellule est un mur
        return this.grid[gridY][gridX] === 1;
    }
    
    // Vérifier si une position est une porte
    isDoor(gridX, gridY) {
        // Vérifier si la position est en dehors de la grille
        if (gridX < 0 || gridY < 0 || gridX >= this.game.gridWidth || gridY >= this.game.gridHeight) {
            return false;
        }
        
        // Vérifier si la cellule est une porte
        return this.grid[gridY][gridX] === 3;
    }
}
