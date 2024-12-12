import { Card } from '../models/Card.js';
import { GameStateService } from '../services/GameStateService.js';

/**
 * Controlador que maneja toda la lógica de arrastrar y soltar cartas
 * Gestiona la interacción entre la baraja y los contenedores de palos
 * Mantiene la sincronización del estado mediante Socket.IO
 */
export class DragController {
    /**
     * Constructor: inicializa el controlador
     */
    constructor() {
        this.init();
        // Suscribirse a actualizaciones de estado
        GameStateService.onStateUpdate(this.handleStateUpdate.bind(this));
    }

    /**
     * Inicializa los eventos de arrastre en contenedores y cartas
     */
    init() {
        this.initContainers();
        this.initCards();
    }

    /**
     * Configura los contenedores para recibir cartas
     * Incluye tanto la baraja como los contenedores de palos
     */
    initContainers() {
        document.querySelectorAll(".contenedor, .baraja").forEach(container => {
            container.addEventListener("dragover", this.handleDragOver.bind(this));
            container.addEventListener("drop", this.handleDrop.bind(this));
        });
    }

    /**
     * Configura las cartas para que sean arrastrables
     * Solo permite arrastrar la carta superior de la baraja
     */
    initCards() {
        document.querySelectorAll(".card").forEach(card => {
            card.setAttribute("draggable", "true");
            card.addEventListener("dragstart", this.handleDragStart.bind(this));
            card.addEventListener("dragend", this.handleDragEnd.bind(this));
        });
    }

    /**
     * Maneja el inicio del arrastre de una carta
     * Verifica si la carta puede ser arrastrada (carta superior en la baraja)
     * @param {DragEvent} event - Evento de inicio de arrastre
     */
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

    /**
     * Maneja el evento de arrastre sobre un contenedor
     * Verifica si la carta puede ser soltada en el contenedor
     * @param {DragEvent} event - Evento de arrastre
     */
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

    /**
     * Maneja la suelta de una carta en un contenedor
     * Actualiza la posición de la carta y sincroniza con el servidor
     * @param {DragEvent} event - Evento de suelta
     */
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

    /**
     * Maneja el fin del arrastre de una carta
     * Limpia los estados visuales del arrastre
     * @param {DragEvent} event - Evento de fin de arrastre
     */
    handleDragEnd(event) {
        event.target.classList.remove('dragging');
    }

    /**
     * Calcula la posición donde se debe colocar la carta en el contenedor
     * @param {DragEvent} event - Evento de suelta
     * @param {HTMLElement} container - Contenedor destino
     * @param {HTMLElement} element - Carta que se está soltando
     * @returns {Object} Posición {left, top} en pixeles
     */
    calculateDropPosition(event, container, element) {
        const rect = container.getBoundingClientRect();
        return {
            left: `${event.clientX - rect.left - (element.offsetWidth / 2)}px`,
            top: `${event.clientY - rect.top - (element.offsetHeight / 2)}px`
        };
    }

    /**
     * Actualiza la posición visual de una carta en el contenedor
     * @param {HTMLElement} card - Carta a posicionar
     * @param {HTMLElement} container - Contenedor donde se coloca
     * @param {Object} position - Posición {left, top}
     */
    updateCardPosition(card, container, position) {
        card.style.position = "absolute";
        card.style.left = position.left;
        card.style.top = position.top;
        if (!container.contains(card)) {
            container.appendChild(card);
        }
    }

    /**
     * Aplica el estado del juego cargado desde el servidor
     * Restaura la posición de todas las cartas
     * @param {Object} state - Estado del juego
     */
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

    /**
     * Procesa las actualizaciones de estado recibidas del servidor
     * Actualiza la interfaz de usuario según los cambios recibidos
     * @param {Object} state - Estado actualizado recibido del servidor
     */
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
