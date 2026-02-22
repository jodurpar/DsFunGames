import { useState, useCallback, useEffect } from 'react';
import { GameMath } from '../core/engine';

export type CardType = 'tank' | 'infantry' | 'artillery' | 'air' | 'special';

export interface Card {
    id: number;
    type: CardType;
    isFlipped: boolean;
    isMatched: boolean;
}

export function useTacticalMemoryEngine() {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const initializeGame = useCallback(() => {
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
        const shuffled = deck
            .sort(() => Math.random() - 0.5)
            .map((card, index) => ({ ...card, id: index }));

        setCards(shuffled);
        setFlippedCards([]);
        setMoves(0);
        setMatches(0);
        setGameOver(false);
    }, []);

    const handleCardClick = useCallback((id: number) => {
        if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched || gameOver) return;

        setCards(prev => {
            const updated = [...prev];
            updated[id] = { ...updated[id], isFlipped: true };
            return updated;
        });

        setFlippedCards(prev => [...prev, id]);
    }, [flippedCards, cards, gameOver]);

    // Handle matching logic
    useEffect(() => {
        if (flippedCards.length !== 2) return;

        const [id1, id2] = flippedCards;
        const card1 = cards[id1];
        const card2 = cards[id2];

        setMoves(m => m + 1);

        if (card1.type === card2.type) {
            // Match found
            const timer = setTimeout(() => {
                setCards(prev => prev.map(card =>
                    card.id === id1 || card.id === id2
                        ? { ...card, isMatched: true, isFlipped: true }
                        : card
                ));
                setFlippedCards([]);
                setMatches(m => {
                    const newMatches = m + 1;
                    if (newMatches === 10) setGameOver(true);
                    return newMatches;
                });
            }, 500);
            return () => clearTimeout(timer);
        } else {
            // No match
            const timer = setTimeout(() => {
                setCards(prev => prev.map(card =>
                    card.id === id1 || card.id === id2
                        ? { ...card, isFlipped: false }
                        : card
                ));
                setFlippedCards([]);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [flippedCards, cards]);

    return {
        state: {
            cards,
            moves,
            matches,
            gameOver,
            isSelectionBusy: flippedCards.length === 2
        },
        actions: {
            handleCardClick,
            initializeGame
        }
    };
}
