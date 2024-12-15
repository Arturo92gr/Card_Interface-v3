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

// Estado del juego
let gameState = {
    cards: {},
    lastUpdate: new Date().toISOString()
};

// Rutas HTTP
app.get('/api/data', (req, res) => {
    res.json({ status: 'success', data: gameState });
});

app.put('/api/cards/:cardId', (req, res) => {
    const { cardId } = req.params;
    const { containerId, position } = req.body;
    
    gameState.cards[cardId] = { containerId, position };
    gameState.lastUpdate = new Date().toISOString();
    
    io.emit('cardMoved', { cardId, containerId, position });
    res.json({ status: 'success', data: gameState.cards[cardId] });
});

// Configurar Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('updateCardPosition', (data) => {
        const { cardId, containerId, position } = data;
        
        // Actualizar estado
        gameState.cards[cardId] = { containerId, position };
        gameState.lastUpdate = new Date().toISOString();
        
        // Emitir a otros clientes
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