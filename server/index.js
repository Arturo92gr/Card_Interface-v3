// Servidor Express con Socket.IO para juego de cartas
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);

// Configurar CORS - Más permisivo para desarrollo
app.use(cors({
    origin: true, // Permite cualquier origen en desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false // Cambiado a false para evitar problemas con CORS
}));

// Middleware para JSON
app.use(express.json());

// Configurar Socket.IO con CORS más permisivo
const io = new Server(server, {
    cors: {
        origin: true, // Permite cualquier origen en desarrollo
        methods: ["GET", "POST", "PUT"],
        credentials: false // Cambiado a false para evitar problemas con CORS
    }
});

// Estado global: posiciones de cartas y timestamp
let gameState = {
    cards: {},
    lastUpdate: new Date().toISOString()
};

// GET: obtener estado actual del juego
app.get('/api/state', (req, res) => {
    res.json({ status: 'success', data: gameState });
});

// POST: actualizar estado completo
app.post('/api/state', (req, res) => {
    gameState = {
        ...req.body,
        lastUpdate: new Date().toISOString()
    };
    res.json({ status: 'success', data: gameState });
});

// PUT: actualizar posición de una carta
app.put('/api/cards/:cardId', (req, res) => {
    const { cardId } = req.params;
    const { containerId, position } = req.body;
    
    gameState.cards[cardId] = { containerId, position };
    gameState.lastUpdate = new Date().toISOString();
    
    // Notificar a todos los clientes
    io.emit('cardMoved', { cardId, containerId, position });
    res.json({ status: 'success', data: gameState.cards[cardId] });
});

// POST: resetear estado del juego
app.post('/api/reset', (req, res) => {
    gameState = {
        cards: {},
        lastUpdate: new Date().toISOString()
    };
    
    // Notificar a todos los clientes del reset
    io.emit('gameReset', gameState);
    
    res.json({ status: 'success', message: 'Game state reset successfully' });
});

// Socket.IO: gestión de conexiones en tiempo real
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Enviar estado inicial al nuevo cliente
    socket.emit('initialState', gameState);

    socket.on('updateCardPosition', (data) => {
        const { cardId, containerId, position } = data;
        
        // Actualizar estado
        gameState.cards[cardId] = { containerId, position };
        gameState.lastUpdate = new Date().toISOString();
        
        // Emitir solo a otros clientes
        socket.broadcast.emit('cardMoved', { cardId, containerId, position });
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});