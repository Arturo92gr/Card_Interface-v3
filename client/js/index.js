import { Card } from "./models/Card.js";
import { DragController } from "./controllers/DragController.js";
import { GameStateService } from "./services/GameStateService.js";
import { SocketIo } from "./connection/SocketIo.js";
import { HttpFetch } from "./connection/HttpFetch.js";

const SOCKET_PORT = 3000;
const FETCH_PORT = 3000;

// Inicializa la baraja sin establecer conexión
function initializeDeck() {
    const barajaContainer = document.querySelector('.baraja');
    if (!barajaContainer) {
        throw new Error('No se encontró el contenedor de la baraja');
    }
    return Card.dealCards(barajaContainer);
}

// Configura los manejadores de eventos para los botones de conexión
function setupConnectionButtons() {
    const statusDiv = document.getElementById('connection-status');

    document.getElementById('fetchBtn').addEventListener('click', async () => {
        try {
            const fetchConnection = new HttpFetch(`http://localhost:${FETCH_PORT}`);
            GameStateService.init(fetchConnection, 'fetch');
            
            // Cargar estado inicial
            const state = await GameStateService.getState();
            if (state) {
                const dragController = new DragController();
                await dragController.applyState(state);
            }
            
            statusDiv.textContent = 'Conectado via HTTP Fetch';
        } catch (error) {
            statusDiv.textContent = `Error de conexión HTTP: ${error.message}`;
        }
    });

    document.getElementById('socketBtn').addEventListener('click', () => {
        try {
            const socketConnection = new SocketIo(`http://localhost:${SOCKET_PORT}`);
            socketConnection.socket.on('connect', async () => {
                GameStateService.init(socketConnection, 'socket');
                
                // Cargar estado inicial
                const state = await GameStateService.getState();
                if (state) {
                    const dragController = new DragController();
                    await dragController.applyState(state);
                }
                
                statusDiv.textContent = 'Conectado via Socket.IO';
            });
            socketConnection.socket.on('connect_error', (error) => {
                statusDiv.textContent = `Error de conexión Socket.IO: ${error.message}`;
            });
        } catch (error) {
            statusDiv.textContent = `Error al inicializar Socket.IO: ${error.message}`;
        }
    });

    document.getElementById('resetBtn').addEventListener('click', async () => {
        if (!confirm('¿Estás seguro de que quieres borrar la partida actual?')) {
            return;
        }

        try {
            await GameStateService.resetGame();
            
            // Limpiar contenedores
            document.querySelector('.baraja').innerHTML = '';
            document.querySelectorAll('.contenedor').forEach(container => {
                container.querySelectorAll('.card').forEach(card => card.remove());
            });
            
            // Reinicializar baraja
            initializeDeck();
            
            // Reinicializar controlador
            new DragController();
            
            statusDiv.textContent = 'Partida reiniciada correctamente';
        } catch (error) {
            statusDiv.textContent = `Error al reiniciar: ${error.message}`;
        }
    });
}

// Función principal que inicializa el juego
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