/**
 * Servicio que maneja la comunicación con el servidor mediante Socket.IO
 * Gestiona la persistencia y sincronización del estado del juego en tiempo real
 */
export class GameStateService {
    /** URL base de la API */
    static API_URL = 'http://localhost:3000/api';
    
    /** Instancia de Socket.IO para comunicación en tiempo real */
    static socketConnection = null;

    /** Colección de callbacks para notificar cambios de estado */
    static stateUpdateCallbacks = new Set();

    /**
     * Inicializa la conexión Socket.IO y configura los eventos
     * @returns {void}
     */
    static init(socketConnection) {
        this.socketConnection = socketConnection;
    }

    /**
     * Registra un callback para ser notificado de cambios en el estado
     * @param {Function} callback - Función a llamar cuando el estado cambie
     */
    static onStateUpdate(callback) {
        this.stateUpdateCallbacks.add(callback);
    }

    /**
     * Notifica a todos los callbacks registrados sobre un cambio de estado
     * @param {Object} state - Nuevo estado del juego
     * @private
     */
    static notifyStateUpdate(state) {
        this.stateUpdateCallbacks.forEach(callback => callback(state));
    }

    /**
     * Obtiene el estado actual del juego desde el servidor
     * @returns {Promise<Object|null>} Estado del juego o null si hay error
     */
    static async getState() {
        try {
            const response = await fetch(`${this.API_URL}/state`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'omit'
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        } catch (error) {
            console.error('Error fetching state:', error);
            return null;
        }
    }

    /**
     * Actualiza la posición de una carta en el servidor
     * @param {string} cardId - ID de la carta
     * @param {string} containerId - ID del contenedor
     * @param {Object} position - Nueva posición {left, top}
     * @returns {Promise<Object|null>} Respuesta del servidor o null si hay error
     */
    static updateCardPosition(cardId, containerId, position) {
        if (this.socketConnection) {
            this.socketConnection.updateCardPosition(cardId, containerId, position);
        }
    }
}
