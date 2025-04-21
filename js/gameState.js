// Module de gestion des états du jeu
class GameState {
    constructor() {
        // États possibles du jeu
        this.states = {
            MENU: 'MENU',         // Menu principal
            PLAYING: 'PLAYING',   // Jeu en cours
            PAUSED: 'PAUSED',     // Jeu en pause
            GAME_OVER: 'GAME_OVER' // Fin de partie
        };
        
        // État initial
        this.currentState = this.states.MENU;
        
        // Données du jeu
        this.score = 0;
        this.level = 1;
    }
    
    // Changer l'état du jeu
    setState(state) {
        if (this.states[state]) {
            this.currentState = this.states[state];
            console.log(`État du jeu changé: ${this.currentState}`);
        } else {
            console.error(`État invalide: ${state}`);
        }
    }
    
    // Vérifier l'état actuel
    isState(state) {
        return this.currentState === this.states[state];
    }
    
    // Ajouter des points au score
    addScore(points) {
        this.score += points;
    }
    
    // Passer au niveau suivant
    nextLevel() {
        this.level++;
    }
    
    // Réinitialiser les données du jeu
    reset() {
        this.score = 0;
        this.level = 1;
    }
}
