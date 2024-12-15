export class HttpFetch {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getGameState() {
        try {
            const response = await fetch(`${this.baseUrl}/api/data`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors'  // Simplificado
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error en HTTP:', error);
            throw error;
        }
    }

    async updateCardPosition(cardId, containerId, position) {
        try {
            const response = await fetch(`${this.baseUrl}/api/cards/${cardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify({ containerId, position })
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating card position:', error);
            return null;
        }
    }
}