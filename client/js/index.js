/**
 * Punto de entrada de la aplicación
 * Inicializa todos los componentes necesarios para el juego
 */

import { Card } from "./models/Card.js";
import { DragController } from "./controllers/DragController.js";
import { GameStateService } from "./services/GameStateService.js";
import { SocketIo } from "./connection/SocketIo.js";
import { HttpFetch } from "./connection/HttpFetch.js";

const SOCKET_PORT = 3000;
const FETCH_PORT = 3000;

/**
 * Inicializa la baraja sin establecer conexión
 */
function initializeDeck() {
    const barajaContainer = document.querySelector('.baraja');
    if (!barajaContainer) {
        throw new Error('No se encontró el contenedor de la baraja');
    }
    return Card.dealCards(barajaContainer);
}

/**
 * Configura los manejadores de eventos para los botones de conexión
 */
function setupConnectionButtons() {
    const statusDiv = document.getElementById('connection-status');

    document.getElementById('fetchBtn').addEventListener('click', async () => {
        try {
            const fetchConnection = new HttpFetch(`http://localhost:${FETCH_PORT}`);
            const response = await fetchConnection.getGameState();
            if (response !== null) {
                GameStateService.init(fetchConnection, 'fetch');
                new DragController();
                statusDiv.textContent = 'Conectado via HTTP Fetch';
            }
        } catch (error) {
            statusDiv.textContent = `Error de conexión HTTP: ${error.message}`;
        }
    });

    document.getElementById('socketBtn').addEventListener('click', () => {
        try {
            const socketConnection = new SocketIo(`http://localhost:${SOCKET_PORT}`);
            socketConnection.socket.on('connect', () => {
                GameStateService.init(socketConnection, 'socket');
                new DragController();
                statusDiv.textContent = 'Conectado via Socket.IO';
            });
            socketConnection.socket.on('connect_error', (error) => {
                statusDiv.textContent = `Error de conexión Socket.IO: ${error.message}`;
            });
        } catch (error) {
            statusDiv.textContent = `Error al inicializar Socket.IO: ${error.message}`;
        }
    });
}

/**
 * Función principal que inicializa el juego
 */
function initializeGame() {
    try {
        // Inicializar la baraja sin conexión
        initializeDeck();
        
        // Configurar botones de conexión
        setupConnectionButtons();
        
    } catch (error) {
        console.error('Error initializing game:', error);
        document.body.innerHTML = `
            <h1>Error de inicialización</h1>
            <p>${error.message}</p>
        `;
    }
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializeGame);