/**
 * Punto de entrada de la aplicación
 * Inicializa todos los componentes necesarios para el juego
 */

import { Card } from "./models/Card.js";
import { DragController } from "./controllers/DragController.js";
import { GameStateService } from "./services/GameStateService.js";
import { SocketIo } from "./connection/SocketIo.js";

/**
 * Función principal que inicializa el juego
 * Configura Socket.IO, crea la baraja y establece el controlador de arrastre
 */
async function initializeGame() {
    // Inicializar Socket.IO
    const socketConnection = new SocketIo();
    GameStateService.init(socketConnection);

    // Inicializar la baraja
    const baraja = document.querySelector('.baraja');
    Card.dealCards(baraja);

    // Inicializar el controlador de arrastre
    new DragController();
}

initializeGame();