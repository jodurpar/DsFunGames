import { useState, useCallback } from 'react';
import { Owner, GameState } from '../core/engine';

/**
 * Hook to manage turn-based gaming logic
 */
export function useTurnBasedSystem(initialOwner: Owner = 'player') {
    const [turn, setTurn] = useState<Owner>(initialOwner);
    const [gameState, setGameState] = useState<GameState>({
        status: 'idle',
        winner: null,
        score: { player: 0, ai: 0 }
    });

    const nextTurn = useCallback(() => {
        setTurn(prev => (prev === 'player' ? 'ai' : 'player'));
    }, []);

    const endBattle = useCallback((winner: Owner | 'draw') => {
        setGameState(prev => ({
            ...prev,
            status: 'gameover',
            winner
        }));
    }, []);

    const startGame = useCallback(() => {
        setGameState({
            status: 'playing',
            winner: null,
            score: { player: 0, ai: 0 }
        });
        setTurn('player');
    }, []);

    return {
        turn,
        gameState,
        actions: {
            nextTurn,
            endBattle,
            startGame,
            setGameState
        }
    };
}
