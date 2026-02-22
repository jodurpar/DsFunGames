export type CardType = 'tank' | 'infantry' | 'artillery' | 'air' | 'special';

export interface Card {
    id: number;
    type: CardType;
    isFlipped: boolean;
    isMatched: boolean;
}

/**
 * Pure logic functions for Tactical Memory
 */
export const MemoryLogic = {
    generateDeck: (): Card[] => {
        const types: CardType[] = ['tank', 'infantry', 'artillery', 'air', 'special'];
        const deck: Card[] = [];

        // Create 2 pairs of each type = 20 cards
        types.forEach(type => {
            for (let i = 0; i < 4; i++) {
                deck.push({
                    id: Math.random(),
                    type,
                    isFlipped: false,
                    isMatched: false,
                });
            }
        });

        // Shuffle and normalize IDs
        return deck
            .sort(() => Math.random() - 0.5)
            .map((card, index) => ({ ...card, id: index }));
    },

    checkMatch: (card1: Card, card2: Card): boolean => {
        return card1.type === card2.type;
    }
};
