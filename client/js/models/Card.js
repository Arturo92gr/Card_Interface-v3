/**
 * Clase que representa una carta de la baraja española
 * Maneja la creación, mezcla y distribución de las cartas
 */
export class Card {
    /** Array con los palos disponibles en la baraja española */
    static palos = ['diamantes', 'corazones', 'picas', 'treboles'];
    
    /**
     * Constructor de la carta
     * @param {number} numero - Número de la carta (1-12)
     * @param {string} palo - Palo de la carta (diamantes, corazones, picas, treboles)
     */
    constructor(numero, palo) {
        // Crear el elemento div que representará la carta
        this.element = document.createElement('div');
        this.element.classList.add('card');
        this.element.dataset.numero = numero;
        this.element.dataset.palo = palo;
        this.element.id = `card-${palo}-${numero}`;
        
        // Mapeo de símbolos para cada palo
        const symbol = {
            'diamantes': '♦',
            'corazones': '♥',
            'picas': '♠',
            'treboles': '♣'
        }[palo];

        // Estructura HTML de la carta con número y símbolo en las esquinas
        this.element.innerHTML = `
            <span class="numero top-left">${numero}</span>
            <span class="palo top-right">${symbol}</span>
            <span class="palo bottom-left">${symbol}</span>
            <span class="numero bottom-right">${numero}</span>
        `;
    }

    /**
     * Crea una baraja completa de 48 cartas (12 por palo)
     * @returns {Card[]} Array con todas las cartas de la baraja
     */
    static createDeck() {
        let deck = [];
        // Para cada palo, crear cartas del 1 al 12
        this.palos.forEach(palo => {
            for (let numero = 1; numero <= 12; numero++) {
                deck.push(new Card(numero, palo));
            }
        });
        return deck;
    }

    /**
     * Mezcla aleatoriamente las cartas usando el algoritmo Fisher-Yates
     * @param {Card[]} deck - Baraja a mezclar
     * @returns {Card[]} Baraja mezclada
     */
    static shuffleDeck(deck) {
        let currentIndex = deck.length, randomIndex;
        // Algoritmo Fisher-Yates para mezclar
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [deck[currentIndex], deck[randomIndex]] = [deck[randomIndex], deck[currentIndex]];
        }
        return deck;
    }

    /**
     * Reparte las cartas en el contenedor especificado
     * @param {HTMLElement} container - Contenedor donde se colocarán las cartas
     * @returns {Card[]} Baraja repartida
     */
    static dealCards(container) {
        const deck = this.shuffleDeck(this.createDeck());
        let offset = 0;
        let zIndex = 1;
        // Colocar cada carta con un desplazamiento y z-index incremental
        deck.forEach(card => {
            card.element.style.position = 'absolute';
            card.element.style.left = `${offset}px`;
            card.element.style.top = '50%';
            card.element.style.transform = 'translateY(-50%)';
            card.element.style.zIndex = zIndex++; // Para control de superposición
            container.appendChild(card.element);
            offset += 20; // Desplazamiento horizontal entre cartas
        });
        return deck;
    }

    /**
     * Obtiene la carta superior del contenedor (la que tiene mayor z-index)
     * @param {HTMLElement} container - Contenedor de cartas
     * @returns {HTMLElement|null} Elemento DOM de la carta superior o null si no hay cartas
     */
    static getTopCard(container) {
        const cards = Array.from(container.querySelectorAll('.card'));
        if (cards.length === 0) return null;
        // Encontrar la carta con el z-index más alto
        return cards.reduce((acc, card) => {
            const zIndex = parseInt(getComputedStyle(card).zIndex);
            return zIndex > parseInt(getComputedStyle(acc).zIndex) ? card : acc;
        }, cards[0]);
    }
}