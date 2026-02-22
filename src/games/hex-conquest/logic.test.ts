import { describe, it, expect } from 'vitest';
import { HexLogic } from './logic';
import { Owner } from '../../core/engine';

describe('HexLogic', () => {
    describe('getAvailableMoves', () => {
        it('should return all indexes for an empty grid', () => {
            const grid: (Owner | null)[] = [null, null, null];
            expect(HexLogic.getAvailableMoves(grid)).toEqual([0, 1, 2]);
        });

        it('should return only empty indexes', () => {
            const grid: (Owner | null)[] = ['player', null, 'ai'];
            expect(HexLogic.getAvailableMoves(grid)).toEqual([1]);
        });

        it('should return empty array for a full grid', () => {
            const grid: (Owner | null)[] = ['player', 'player', 'ai'];
            expect(HexLogic.getAvailableMoves(grid)).toEqual([]);
        });
    });

    describe('calculateRandomMove', () => {
        it('should return a valid move if available', () => {
            const grid: (Owner | null)[] = ['player', null, 'ai'];
            expect(HexLogic.calculateRandomMove(grid)).toBe(1);
        });

        it('should return null if no moves available', () => {
            const grid: (Owner | null)[] = ['player', 'player', 'ai'];
            expect(HexLogic.calculateRandomMove(grid)).toBe(null);
        });
    });

    describe('checkGameOver', () => {
        it('should return isFull false and winner null if not full', () => {
            const grid: (Owner | null)[] = ['player', null, 'ai'];
            expect(HexLogic.checkGameOver(grid)).toEqual({ isFull: false, winner: null });
        });

        it('should determine player as winner', () => {
            const grid: (Owner | null)[] = ['player', 'player', 'ai'];
            expect(HexLogic.checkGameOver(grid)).toEqual({ isFull: true, winner: 'player' });
        });

        it('should determine ai as winner', () => {
            const grid: (Owner | null)[] = ['player', 'ai', 'ai'];
            expect(HexLogic.checkGameOver(grid)).toEqual({ isFull: true, winner: 'ai' });
        });

        it('should determine draw', () => {
            const grid: (Owner | null)[] = ['player', 'ai'];
            expect(HexLogic.checkGameOver(grid)).toEqual({ isFull: true, winner: 'draw' });
        });
    });
});
