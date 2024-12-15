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