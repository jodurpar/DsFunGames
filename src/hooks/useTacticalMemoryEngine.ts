import { useState, useCallback, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { MemoryLogic, Card, CardType } from '../games/tactical-memory/logic';

export type { Card, CardType };

const GAME_ID = 'tactical-memory';

export function useTacticalMemoryEngine() {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Global Store Actions
    const updateHighScore = useGameStore(state => state.updateHighScore);
    const incrementWins = useGameStore(state => state.incrementWins);
    const incrementPlays = useGameStore(state => state.incrementPlays);

    const initializeGame = useCallback(() => {
        const shuffled = MemoryLogic.generateDeck();
        setCards(shuffled);
        setFlippedCards([]);
        setMoves(0);
        setMatches(0);
        setGameOver(false);
        incrementPlays(GAME_ID);
    }, [incrementPlays]);

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

        if (MemoryLogic.checkMatch(card1, card2)) {
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
                    if (newMatches === 10) {
                        setGameOver(true);
                        incrementWins(GAME_ID);
                        // Lower moves is a higher score essentially, we save the lowest amount of moves as the highscore
                        // For leaderboard sorting purposes, we update highscore if currenthighscore is 0, or if its less moves
                        updateHighScore(GAME_ID, moves + 1);
                    }
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
    }, [flippedCards, cards, incrementWins, updateHighScore]);

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
