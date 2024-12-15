// Utilidades para el arrastre de cartas
export const DragUtils = {
    // Calcula posición de suelta
    calculateDropPosition(event, container, element) {
        const rect = container.getBoundingClientRect();
        return {
            left: `${event.clientX - rect.left - (element.offsetWidth / 2)}px`,
            top: `${event.clientY - rect.top - (element.offsetHeight / 2)}px`
        };
    },

    // Valida si la suelta es permitida
    isValidDrop(cardPalo, containerPalo, isBaraja) {
        return containerPalo === cardPalo || isBaraja;
    }
};
