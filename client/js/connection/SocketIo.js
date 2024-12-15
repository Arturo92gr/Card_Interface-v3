import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

export class SocketIo {
    constructor(url) {
        this.socket = io(url, {
            withCredentials: false, // Cambiado a false
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true
        });
        this.setupListeners();
    }

    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Conectado a Socket.IO');
        });

        this.socket.on('disconnect', () => {
            console.log('Desconectado de Socket.IO');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    updateCardPosition(cardId, containerId, position) {
        this.socket.emit('updateCardPosition', { cardId, containerId, position });
    }
}