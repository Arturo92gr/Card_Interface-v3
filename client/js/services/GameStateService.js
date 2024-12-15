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
     * Inicializa la conexión con el servidor
     * @param {Object} connection - Instancia de la conexión (Socket.IO o HttpFetch)
     * @param {string} type - Tipo de conexión ('socket' o 'fetch')
     */
    static init(connection, type) {
        this.connection = connection;
        this.connectionType = type;
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
     * Actualiza la posición de una carta en el servidor
     * @param {string} cardId - ID de la carta
     * @param {string} containerId - ID del contenedor
     * @param {Object} position - Nueva posición {left, top}
     * @returns {Promise<Object|null>} Respuesta del servidor o null si hay error
     */
    static async updateCardPosition(cardId, containerId, position) {
        if (!this.connection) return;

        try {
            if (this.connectionType === 'socket') {
                this.connection.updateCardPosition(cardId, containerId, position);
            } else {
                await this.connection.updateCardPosition(cardId, containerId, position);
            }
        } catch (error) {
            console.error('Error updating card position:', error);
        }
    }
}
