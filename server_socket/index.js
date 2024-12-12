/**
 * Servidor Express que gestiona el estado del juego
 * Implementa Socket.IO para comunicación en tiempo real
 * Proporciona endpoints REST para operaciones CRUD del estado
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Configuración inicial del servidor Express
const app = express();
const httpServer = createServer(app);

// Configuración actualizada de CORS para Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: ["*"],
        methods: ["GET", "POST", "PUT"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
});

// Configuración CORS para Express
app.use(cors({
    origin: ["*"],
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Middleware para procesar JSON
app.use(express.json());

/**
 * Estado global del juego
 * Almacena la posición de cada carta por su ID
 * @type {Object}
 */
let gameState = {
    cards: {}
};

/**
 * Configuración de Socket.IO
 * Maneja eventos de conexión, desconexión y actualización de cartas
 * Mantiene sincronizado el estado entre todos los clientes conectados
 */
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Enviar estado inicial al nuevo cliente
    socket.emit('initialState', gameState);

    /**
     * Maneja la actualización de posición de una carta
     * Actualiza el estado global y notifica a otros clientes
     * @param {Object} data - Datos de la actualización
     * @param {string} data.cardId - ID de la carta
     * @param {string} data.containerId - ID del contenedor
     * @param {Object} data.position - Nueva posición {left, top}
     */
    socket.on('updateCardPosition', ({ cardId, containerId, position }) => {
        gameState.cards[cardId] = { containerId, position };
        // Emitir la actualización a todos los clientes excepto al emisor
        socket.broadcast.emit('cardMoved', { cardId, containerId, position });
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Endpoints de la API
/**
 * GET /api/state - Obtiene el estado actual del juego
 */
app.get('/api/state', (req, res) => {
    res.json(gameState);
});

/**
 * POST /api/state - Actualiza el estado completo del juego
 */
app.post('/api/state', (req, res) => {
    gameState = req.body;
    res.json({ success: true });
});

/**
 * PUT /api/cards/:cardId - Actualiza la posición de una carta específica
 */
app.put('/api/cards/:cardId', (req, res) => {
    const { cardId } = req.params;
    const cardState = req.body;
    gameState.cards[cardId] = cardState;
    res.json({ success: true });
});

// Iniciar el servidor
const port = 3000;
httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
