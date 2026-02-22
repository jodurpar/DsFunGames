import { describe, it, expect } from 'vitest';
import { RobotLogic } from './logic';

describe('RobotLogic', () => {
    describe('calculateNextPosition', () => {
        it('should move UP correctly', () => {
            const pos = RobotLogic.calculateNextPosition({ x: 5, y: 5 }, 'UP');
            expect(pos).toEqual({ x: 5, y: 4 });
        });

        it('should move DOWN correctly', () => {
            const pos = RobotLogic.calculateNextPosition({ x: 5, y: 5 }, 'DOWN');
            expect(pos).toEqual({ x: 5, y: 6 });
        });

        it('should move LEFT correctly', () => {
            const pos = RobotLogic.calculateNextPosition({ x: 5, y: 5 }, 'LEFT');
            expect(pos).toEqual({ x: 4, y: 5 });
        });

        it('should move RIGHT correctly', () => {
            const pos = RobotLogic.calculateNextPosition({ x: 5, y: 5 }, 'RIGHT');
            expect(pos).toEqual({ x: 6, y: 5 });
        });
    });

    describe('generatePath', () => {
        it('should generate a valid path array', () => {
            const { path } = RobotLogic.generatePath(10, 10, 1);
            expect(path.length).toBeGreaterThan(1);
            expect(path[0]).toEqual({ x: 0, y: 0 });
        });
    });
});
