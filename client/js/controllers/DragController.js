import { Card } from '../models/Card.js';
import { GameStateService } from '../services/GameStateService.js';

// Controlador de arrastre y colocación de cartas
export class DragController {
    /**
     * Constructor: inicializa el controlador
     */
    // Inicializa eventos de arrastre
    constructor() {
        this.init();
        // Suscribirse a actualizaciones de estado
        GameStateService.onStateUpdate(this.handleStateUpdate.bind(this));
    }

    // Inicializa los eventos de arrastre en contenedores y cartas
    init() {
        this.initContainers();
        this.initCards();
    }

    // Configura contenedores para recibir cartas
    initContainers() {
        document.querySelectorAll(".contenedor, .baraja").forEach(container => {
            container.addEventListener("dragover", this.handleDragOver.bind(this));
            container.addEventListener("drop", this.handleDrop.bind(this));
        });
    }

    // Configura cartas para ser arrastrables
    initCards() {
        document.querySelectorAll(".card").forEach(card => {
            card.setAttribute("draggable", "true");
            card.addEventListener("dragstart", this.handleDragStart.bind(this));
            card.addEventListener("dragend", this.handleDragEnd.bind(this));
        });
    }

    // Maneja inicio de arrastre
    handleDragStart(event) {
        const barajaContainer = event.target.closest('.baraja');
        if (barajaContainer) {
            const topCard = Card.getTopCard(barajaContainer);
            if (event.target !== topCard) {
                event.preventDefault();
                return;
            }
        }

        event.target.classList.add('dragging');
        event.dataTransfer.setData("text", JSON.stringify({
            id: event.target.id
        }));
    }

    // Valida si la carta puede soltarse
    handleDragOver(event) {
        const draggedElement = document.querySelector('.dragging');
        if (!draggedElement) return;

        const container = event.currentTarget;
        const cardPalo = draggedElement.dataset.palo;
        const containerPalo = container.dataset.palo;

        if (containerPalo === cardPalo || container.classList.contains('baraja')) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
        }
    }

    // Procesa suelta de carta
    async handleDrop(event) {
        const data = JSON.parse(event.dataTransfer.getData("text"));
        const draggedElement = document.getElementById(data.id);
        const container = event.currentTarget;
        const cardPalo = draggedElement.dataset.palo;
        const containerPalo = container.dataset.palo;

        if (containerPalo === cardPalo || container.classList.contains('baraja')) {
            event.preventDefault();
            const position = this.calculateDropPosition(event, container, draggedElement);
            
            this.updateCardPosition(draggedElement, container, position);
            GameStateService.updateCardPosition(
                draggedElement.id,
                container.dataset.palo || 'baraja',
                position
            );
        }
    }

    // Maneja el fin del arrastre de una carta
    handleDragEnd(event) {
        event.target.classList.remove('dragging');
    }

    // Calcula la posición donde se debe colocar la carta en el contenedor
    calculateDropPosition(event, container, element) {
        const rect = container.getBoundingClientRect();
        return {
            left: `${event.clientX - rect.left - (element.offsetWidth / 2)}px`,
            top: `${event.clientY - rect.top - (element.offsetHeight / 2)}px`
        };
    }

    // Actualiza la posición visual de una carta en el contenedor
    updateCardPosition(card, container, position) {
        card.style.position = "absolute";
        card.style.left = position.left;
        card.style.top = position.top;
        if (!container.contains(card)) {
            container.appendChild(card);
        }
    }

    // Aplica estado recibido del servidor
    async applyState(state) {
        if (state && state.cards) {
            Object.entries(state.cards).forEach(([cardId, cardState]) => {
                const card = document.getElementById(cardId);
                const container = document.querySelector(
                    cardState.containerId === 'baraja' 
                        ? '.baraja' 
                        : `[data-palo="${cardState.containerId}"]`
                );
                
                if (card && container) {
                    this.updateCardPosition(card, container, cardState.position);
                }
            });
        }
    }

    // Procesa las actualizaciones de estado recibidas del servidor
    handleStateUpdate(state) {
        if (state && state.cards) {
            Object.entries(state.cards).forEach(([cardId, cardState]) => {
                const card = document.getElementById(cardId);
                const container = document.querySelector(
                    cardState.containerId === 'baraja' 
                        ? '.baraja' 
                        : `[data-palo="${cardState.containerId}"]`
                );
                
                if (card && container) {
                    this.updateCardPosition(card, container, cardState.position);
                }
            });
        }
    }
}
