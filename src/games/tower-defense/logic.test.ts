import { describe, it, expect } from 'vitest';
import { TDLogic } from './logic';

describe('TDLogic', () => {
    describe('calculateDistance', () => {
        it('should calculate distance correctly', () => {
            const p1 = { x: 0, y: 0 };
            const p2 = { x: 3, y: 4 };
            expect(TDLogic.calculateDistance(p1, p2)).toBe(5);
        });
    });

    describe('generateRandomPath', () => {
        it('should generate a path that reaches the end of the grid', () => {
            const width = 10;
            const height = 8;
            const path = TDLogic.generateRandomPath(width, height);

            expect(path.length).toBeGreaterThan(0);
            expect(path[0].x).toBe(0);
            expect(path[path.length - 1].x).toBe(width - 1);
        });
    });

    describe('calculateEnemyPosition', () => {
        const mockPath = [
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 }
        ];

        it('should return start position at progress 0', () => {
            const pos = TDLogic.calculateEnemyPosition(mockPath, 0);
            expect(pos).toEqual({ x: 0, y: 2 });
        });

        it('should interpolate position correctly', () => {
            const pos = TDLogic.calculateEnemyPosition(mockPath, 5); // Halfway between first and second point
            expect(pos).toEqual({ x: 0.5, y: 2 });
        });

        it('should handle index at the end of path', () => {
            const pos = TDLogic.calculateEnemyPosition(mockPath, 20);
            expect(pos).toEqual({ x: 2, y: 2 });
        });
    });

    describe('isInRange', () => {
        it('should identify points within range', () => {
            const p1 = { x: 0, y: 0 };
            const p2 = { x: 1, y: 1 };
            expect(TDLogic.isInRange(p1, p2, 2)).toBe(true);
            expect(TDLogic.isInRange(p1, p2, 1)).toBe(false);
        });
    });
});
