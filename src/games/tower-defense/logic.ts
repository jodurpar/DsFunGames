import { Position } from '../../hooks/useTowerDefenseEngine';

/**
 * Pure logic functions for Tower Defense.
 * Recommendation 2: Refactoring into smaller, composable pieces.
 */

export const TDLogic = {
    /**
     * Calculates distance between two points.
     */
    calculateDistance: (p1: Position, p2: Position): number => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    },

    /**
     * Generates a random path for the creeps to follow.
     */
    generateRandomPath: (width: number, height: number): Position[] => {
        const path: Position[] = [];
        let curX = 0;
        let curY = Math.floor(Math.random() * (height - 4)) + 2;

        path.push({ x: curX, y: curY });

        while (curX < width - 1) {
            const rightSteps = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < rightSteps && curX < width - 1; i++) {
                curX++;
                path.push({ x: curX, y: curY });
            }

            if (curX < width - 1) {
                const moveY = Math.random() > 0.5 ? 1 : -1;
                const ySteps = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < ySteps; i++) {
                    const nextY = curY + moveY;
                    if (nextY >= 1 && nextY < height - 1) {
                        curY = nextY;
                        path.push({ x: curX, y: curY });
                    } else {
                        break;
                    }
                }
            }
        }
        return path;
    },

    /**
     * Calculates enemy position based on total progress (pathIndex).
     */
    calculateEnemyPosition: (path: Position[], pathIndex: number): Position => {
        const totalSteps = path.length * 10;
        const clampedIndex = Math.max(0, Math.min(totalSteps - 1, pathIndex));

        const currentPathStep = Math.floor(clampedIndex / 10);
        const nextPathStep = Math.min(path.length - 1, currentPathStep + 1);
        const t = (clampedIndex % 10) / 10;

        return {
            x: path[currentPathStep].x + (path[nextPathStep].x - path[currentPathStep].x) * t,
            y: path[currentPathStep].y + (path[nextPathStep].y - path[currentPathStep].y) * t,
        };
    },

    /**
     * Checks if a point is within range.
     */
    isInRange: (p1: Position, p2: Position, range: number): boolean => {
        return TDLogic.calculateDistance(p1, p2) <= range;
    }
};
