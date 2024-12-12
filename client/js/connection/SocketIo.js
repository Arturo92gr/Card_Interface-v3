import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

export class SocketIo {
    constructor(serverUrl = 'http://localhost:3000') {
        this.socket = io(serverUrl, {
            withCredentials: true
        });
        this.setupListeners();
    }

    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server with ID:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('initialState', (gameState) => {
            // Handle initial state
            console.log('Received initial state:', gameState);
        });

        this.socket.on('cardMoved', ({ cardId, containerId, position }) => {
            // Handle card movement from other clients
            console.log('Card moved by other client:', { cardId, containerId, position });
        });
    }

    updateCardPosition(cardId, containerId, position) {
        this.socket.emit('updateCardPosition', { cardId, containerId, position });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}
