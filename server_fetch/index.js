/**
 * Servidor Express que gestiona el estado del juego
 * Implementa endpoints REST para operaciones CRUD del estado
 */

import express from 'express';
import cors from 'cors';

// Configuración inicial del servidor Express
const app = express();

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
    res.json({ 
        success: true,
        message: 'Estado actualizado correctamente',
        state: gameState 
    });
});

/**
 * PUT /api/cards/:cardId - Actualiza la posición de una carta específica
 */
app.put('/api/cards/:cardId', (req, res) => {
    const { cardId } = req.params;
    const cardState = req.body;
    
    gameState.cards[cardId] = cardState;
    
    res.json({ 
        success: true,
        message: 'Carta actualizada correctamente',
        card: {
            id: cardId,
            ...cardState
        }
    });
});

/**
 * GET /api/cards - Obtiene el estado de todas las cartas
 */
app.get('/api/cards', (req, res) => {
    res.json(gameState.cards);
});

// Iniciar el servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
