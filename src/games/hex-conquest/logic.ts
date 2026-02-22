import { Owner } from '../../core/engine';

export const HexLogic = {
    getAvailableMoves: (grid: (Owner | null)[]): number[] => {
        return grid.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null) as number[];
    },

    calculateRandomMove: (grid: (Owner | null)[]): number | null => {
        const availableMoves = HexLogic.getAvailableMoves(grid);
        if (availableMoves.length === 0) return null;
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    },

    checkGameOver: (grid: (Owner | null)[]): { isFull: boolean, winner: Owner | 'draw' | null } => {
        const isFull = grid.every(cell => cell !== null);

        if (!isFull) {
            return { isFull: false, winner: null };
        }

        const playerScore = grid.filter(c => c === 'player').length;
        const aiScore = grid.filter(c => c === 'ai').length;

        if (playerScore > aiScore) return { isFull: true, winner: 'player' };
        if (aiScore > playerScore) return { isFull: true, winner: 'ai' };

        return { isFull: true, winner: 'draw' };
    }
};
