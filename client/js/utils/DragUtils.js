export const DragUtils = {
    calculateDropPosition(event, container, element) {
        const rect = container.getBoundingClientRect();
        return {
            left: `${event.clientX - rect.left - (element.offsetWidth / 2)}px`,
            top: `${event.clientY - rect.top - (element.offsetHeight / 2)}px`
        };
    },

    isValidDrop(cardPalo, containerPalo, isBaraja) {
        return containerPalo === cardPalo || isBaraja;
    }
};
