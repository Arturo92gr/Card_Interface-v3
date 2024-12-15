// Servicio de sincronización del estado del juego
export class GameStateService {
    // URL base API del servidor
    static API_URL = 'http://localhost:3000/api';
    
    // Conexión Socket.IO activa
    static socketConnection = null;

    // Callbacks para notificar cambios
    static stateUpdateCallbacks = new Set();

    // Último estado conocido
    static lastState = null;

    // Inicializa conexión HTTP o Socket.IO
    static init(connection, type) {
        this.connection = connection;
        this.connectionType = type;

        if (type === 'socket') {
            // Escuchar estado inicial y actualizaciones
            connection.socket.on('initialState', (state) => {
                this.lastState = state;
                this.notifyStateUpdate(state);
            });

            connection.socket.on('cardMoved', (update) => {
                if (this.lastState) {
                    this.lastState.cards[update.cardId] = {
                        containerId: update.containerId,
                        position: update.position
                    };
                    this.notifyStateUpdate(this.lastState);
                }
            });

            // Añadir listener para reset
            connection.socket.on('gameReset', (newState) => {
                this.lastState = newState;
                this.notifyStateUpdate(newState);
            });
        }
    }

    // Gestiona actualizaciones de estado
    static onStateUpdate(callback) {
        this.stateUpdateCallbacks.add(callback);
    }

    // Obtiene estado actual del servidor
    static async getState() {
        try {
            const response = await fetch(`${this.API_URL}/state`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const { data } = await response.json();
            this.lastState = data;
            return data;
        } catch (error) {
            console.error('Error fetching state:', error);
            return null;
        }
    }

    // Actualiza posición de una carta
    static async updateCardPosition(cardId, containerId, position) {
        if (!this.connection) return;

        try {
            if (this.connectionType === 'socket') {
                this.connection.updateCardPosition(cardId, containerId, position);
            } else {
                await this.connection.updateCardPosition(cardId, containerId, position);
            }

            // Actualizar estado local
            if (this.lastState) {
                this.lastState.cards[cardId] = { containerId, position };
            }
        } catch (error) {
            console.error('Error updating card position:', error);
        }
    }

    // Resetea el juego al estado inicial
    static async resetGame() {
        try {
            const response = await fetch(`${this.API_URL}/reset`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            
            // Limpiar estado local
            this.lastState = null;
            
            return result;
        } catch (error) {
            console.error('Error resetting game:', error);
            throw error;
        }
    }
}
