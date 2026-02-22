import { Vector2 } from '../../core/engine';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Instruction {
    id: string;
    direction: Direction;
    steps: number;
}

export type CellType = 'PATH' | 'BUILDING' | 'TARGET' | 'START' | 'GRASS';

export interface GridCell {
    type: CellType;
    buildingType?: string;
    isLarge?: boolean;
    isAnchor?: boolean;
}

export const BUILDINGS = [
    'Hospital', 'School', 'City Hall', 'Cinema', 'Market',
    'Park', 'Library', 'Gym', 'Fire Station', 'Police Station',
    'Bank', 'Coffee Shop', 'Restaurant', 'Museum', 'Stadium',
    'Factory', 'Warehouse', 'Church', 'Hotel', 'Music Hall'
];

/**
 * Pure logic functions for Logic Robot.
 */
export const RobotLogic = {
    generatePath: (gridWidth: number, gridHeight: number, level: number): { path: Vector2[], success: boolean } => {
        let path: Vector2[] = [{ x: 0, y: 0 }];
        let currX = 0;
        let currY = 0;
        let success = false;

        for (let attempts = 0; attempts < 100; attempts++) {
            path = [{ x: 0, y: 0 }];
            currX = 0;
            currY = 0;
            let stuck = false;

            const targetLength = 15 + (level * 3);

            for (let step = 0; step < targetLength; step++) {
                const moves: Vector2[] = [];
                if (currX < gridWidth - 1) moves.push({ x: currX + 1, y: currY });
                if (currY < gridHeight - 1) moves.push({ x: currX, y: currY + 1 });
                if (currX > 0) moves.push({ x: currX - 1, y: currY });
                if (currY > 0) moves.push({ x: currX, y: currY - 1 });

                const validMoves = moves.filter(m => {
                    if (path.some(p => p.x === m.x && p.y === m.y)) return false;

                    let neighborsInPath = 0;
                    if (path.some(p => p.x === m.x + 1 && p.y === m.y)) neighborsInPath++;
                    if (path.some(p => p.x === m.x - 1 && p.y === m.y)) neighborsInPath++;
                    if (path.some(p => p.x === m.x && p.y === m.y + 1)) neighborsInPath++;
                    if (path.some(p => p.x === m.x && p.y === m.y - 1)) neighborsInPath++;

                    return neighborsInPath <= 1;
                });

                if (validMoves.length === 0) {
                    stuck = true;
                    break;
                }

                let next;
                if (Math.random() > 0.3) {
                    const preferred = validMoves.filter(m => m.x >= currX && m.y >= currY);
                    if (preferred.length > 0) {
                        next = preferred[Math.floor(Math.random() * preferred.length)];
                    } else {
                        next = validMoves[Math.floor(Math.random() * validMoves.length)];
                    }
                } else {
                    next = validMoves[Math.floor(Math.random() * validMoves.length)];
                }

                path.push(next);
                currX = next.x;
                currY = next.y;
            }

            const distFromStart = Math.abs(currX) + Math.abs(currY);
            if (!stuck && distFromStart >= (gridWidth / 2)) {
                success = true;
                break;
            }
        }

        if (!success) {
            path = [{ x: 0, y: 0 }];
            for (let i = 1; i < gridWidth; i++) path.push({ x: i, y: 0 });
            for (let i = 1; i < gridHeight; i++) path.push({ x: gridWidth - 1, y: i });
        }

        return { path, success };
    },

    placeBuildings: (grid: GridCell[][], gridWidth: number, gridHeight: number): void => {
        const LARGE_BUILDINGS_TYPES = ['Park', 'School'];

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                if (grid[y][x].type !== 'GRASS') continue;

                let isAdjacent = false;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const ny = y + dy;
                        const nx = x + dx;
                        if (ny >= 0 && ny < gridHeight && nx >= 0 && nx < gridWidth) {
                            const ct = grid[ny][nx].type;
                            if (ct === 'PATH' || ct === 'START' || ct === 'TARGET') {
                                isAdjacent = true;
                                break;
                            }
                        }
                    }
                    if (isAdjacent) break;
                }

                if (isAdjacent) {
                    if (Math.random() < 0.25) {
                        const type = LARGE_BUILDINGS_TYPES[Math.floor(Math.random() * LARGE_BUILDINGS_TYPES.length)];
                        let canPlace = true;
                        if (y + 1 >= gridHeight || x + 1 >= gridWidth) canPlace = false;
                        else {
                            for (let dy = 0; dy <= 1; dy++) {
                                for (let dx = 0; dx <= 1; dx++) {
                                    if (grid[y + dy][x + dx].type !== 'GRASS') canPlace = false;
                                }
                            }
                        }

                        if (canPlace) {
                            for (let dy = 0; dy <= 1; dy++) {
                                for (let dx = 0; dx <= 1; dx++) {
                                    grid[y + dy][x + dx] = {
                                        type: 'BUILDING',
                                        buildingType: type,
                                        isLarge: true,
                                        isAnchor: dy === 0 && dx === 0
                                    };
                                }
                            }
                            continue;
                        }
                    }

                    const nearbyTypes = new Set<string>();
                    const range = 5;
                    for (let dy = -range; dy <= range; dy++) {
                        for (let dx = -range; dx <= range; dx++) {
                            if (Math.abs(dx) + Math.abs(dy) >= range) continue;
                            const ny = y + dy;
                            const nx = x + dx;
                            if (ny >= 0 && ny < gridHeight && nx >= 0 && nx < gridWidth) {
                                const cell = grid[ny][nx];
                                if (cell.type === 'BUILDING' && cell.buildingType && (!cell.isLarge || cell.isAnchor)) {
                                    nearbyTypes.add(cell.buildingType);
                                }
                            }
                        }
                    }

                    const pool = BUILDINGS.filter(b => !nearbyTypes.has(b) && !LARGE_BUILDINGS_TYPES.includes(b));
                    const finalSelection = pool.length > 0 ? pool : BUILDINGS.filter(b => !LARGE_BUILDINGS_TYPES.includes(b));

                    grid[y][x] = {
                        type: 'BUILDING',
                        buildingType: finalSelection[Math.floor(Math.random() * finalSelection.length)],
                        isLarge: false,
                        isAnchor: true
                    };
                }
            }
        }
    },

    calculateNextPosition: (currentPos: Vector2, direction: Direction): Vector2 => {
        const { x, y } = currentPos;
        switch (direction) {
            case 'UP': return { x, y: y - 1 };
            case 'DOWN': return { x, y: y + 1 };
            case 'LEFT': return { x: x - 1, y };
            case 'RIGHT': return { x: x + 1, y };
        }
    }
};
