import { useState, useCallback, useEffect } from 'react';
import { Vector2 } from '../core/engine';

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

const BUILDINGS = [
    'Hospital', 'School', 'City Hall', 'Cinema', 'Market',
    'Park', 'Library', 'Gym', 'Fire Station', 'Police Station',
    'Bank', 'Coffee Shop', 'Restaurant', 'Museum', 'Stadium',
    'Factory', 'Warehouse', 'Church', 'Hotel', 'Music Hall'
];

export function useRobotEngine() {
    const [level, setLevel] = useState(0);
    const GRID_WIDTH = 10 + level;
    const GRID_HEIGHT = 10;

    const [grid, setGrid] = useState<GridCell[][]>([]);
    const [robotPos, setRobotPos] = useState<Vector2>({ x: 0, y: 0 });
    const [targetPos, setTargetPos] = useState<Vector2>({ x: 0, y: 0 });
    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [currentInstructionIndex, setCurrentInstructionIndex] = useState(-1);
    const [score, setScore] = useState({ won: 0, lost: 0 });
    const [message, setMessage] = useState('Program your robot to reach the target!');

    // Level Generation
    const generateLevel = useCallback(() => {
        const newGrid: GridCell[][] = Array(GRID_HEIGHT).fill(null).map(() =>
            Array(GRID_WIDTH).fill(null).map(() => ({ type: 'GRASS' }))
        );

        let path: Vector2[] = [{ x: 0, y: 0 }];
        newGrid[0][0] = { type: 'START' };

        let currX = 0;
        let currY = 0;
        let success = false;

        // Simple reliable path generation:
        // Try to generate a random path up to max length. If it gets stuck or finishes, we just set the target at the last cell as long as it's far enough.
        for (let attempts = 0; attempts < 100; attempts++) {
            path = [{ x: 0, y: 0 }];
            currX = 0;
            currY = 0;
            let stuck = false;

            const targetLength = 15 + (level * 3);

            for (let step = 0; step < targetLength; step++) {
                const moves: Vector2[] = [];
                if (currX < GRID_WIDTH - 1) moves.push({ x: currX + 1, y: currY });
                if (currY < GRID_HEIGHT - 1) moves.push({ x: currX, y: currY + 1 });
                if (currX > 0) moves.push({ x: currX - 1, y: currY });
                if (currY > 0) moves.push({ x: currX, y: currY - 1 });

                // Filter out moves that are already in the path or adjacent to the path (except the current cell) to prevent 2x2 grids of path
                const validMoves = moves.filter(m => {
                    if (path.some(p => p.x === m.x && p.y === m.y)) return false;

                    // Simple check: don't allow path to touch itself to stay clean
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

                // Prefer moving right and down to reach the bottom right
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
            if (!stuck && distFromStart >= (GRID_WIDTH / 2)) {
                success = true;
                break;
            }
        }

        // Failsafe if completely stuck 100 times
        if (!success) {
            path = [{ x: 0, y: 0 }];
            for (let i = 1; i < GRID_WIDTH; i++) path.push({ x: i, y: 0 });
            for (let i = 1; i < GRID_HEIGHT; i++) path.push({ x: GRID_WIDTH - 1, y: i });
        }

        path.forEach((p, idx) => {
            if (idx === 0) return;
            newGrid[p.y][p.x] = { type: 'PATH' };
        });

        const last = path[path.length - 1];
        newGrid[last.y][last.x] = { type: 'TARGET', buildingType: 'Target' };

        // Final state updates
        setGrid(newGrid);
        setTargetPos(last);
        setRobotPos({ x: 0, y: 0 });
        setInstructions([]);
        setIsExecuting(false);
        setCurrentInstructionIndex(-1);
        setMessage('Level generated. Plan your route!');

        // 3. Place buildings with Variety Logic
        const LARGE_BUILDINGS_TYPES = ['Park', 'School'];

        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (newGrid[y][x].type !== 'GRASS') continue;

                let isAdjacent = false;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const ny = y + dy;
                        const nx = x + dx;
                        if (ny >= 0 && ny < GRID_HEIGHT && nx >= 0 && nx < GRID_WIDTH) {
                            const ct = newGrid[ny][nx].type;
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
                        if (y + 1 >= GRID_HEIGHT || x + 1 >= GRID_WIDTH) canPlace = false;
                        else {
                            for (let dy = 0; dy <= 1; dy++) {
                                for (let dx = 0; dx <= 1; dx++) {
                                    if (newGrid[y + dy][x + dx].type !== 'GRASS') canPlace = false;
                                }
                            }
                        }

                        if (canPlace) {
                            for (let dy = 0; dy <= 1; dy++) {
                                for (let dx = 0; dx <= 1; dx++) {
                                    newGrid[y + dy][x + dx] = {
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
                            if (ny >= 0 && ny < GRID_HEIGHT && nx >= 0 && nx < GRID_WIDTH) {
                                const cell = newGrid[ny][nx];
                                if (cell.type === 'BUILDING' && cell.buildingType && (!cell.isLarge || cell.isAnchor)) {
                                    nearbyTypes.add(cell.buildingType);
                                }
                            }
                        }
                    }

                    const pool = BUILDINGS.filter(b => !nearbyTypes.has(b) && !LARGE_BUILDINGS_TYPES.includes(b));
                    const finalSelection = pool.length > 0 ? pool : BUILDINGS.filter(b => !LARGE_BUILDINGS_TYPES.includes(b));

                    newGrid[y][x] = {
                        type: 'BUILDING',
                        buildingType: finalSelection[Math.floor(Math.random() * finalSelection.length)],
                        isLarge: false,
                        isAnchor: true
                    };
                }
            }
        }
        setGrid([...newGrid]);
    }, [GRID_WIDTH, GRID_HEIGHT, level]);

    useEffect(() => {
        setScore({ won: 0, lost: 0 });
        generateLevel();
    }, [level]);

    useEffect(() => {
        if (grid.length === 0) generateLevel();
    }, [generateLevel]);

    const addInstruction = (direction: Direction) => {
        if (instructions.length >= 14 || isExecuting) return;
        const newInst: Instruction = {
            id: Math.random().toString(36).substr(2, 9),
            direction,
            steps: 1
        };
        setInstructions([...instructions, newInst]);
    };

    const removeInstruction = (id: string) => {
        if (isExecuting) return;
        setInstructions(instructions.filter(i => i.id !== id));
    };

    const updateSteps = (id: string, delta: number) => {
        if (isExecuting) return;
        setInstructions(instructions.map(i => {
            if (i.id === id) {
                return { ...i, steps: Math.max(1, Math.min(9, i.steps + delta)) };
            }
            return i;
        }));
    };

    const clearInstructions = () => {
        if (isExecuting) return;
        setInstructions([]);
    };

    const runProgram = async () => {
        if (isExecuting || instructions.length === 0) return;
        setIsExecuting(true);
        let currentX = 0;
        let currentY = 0;
        setRobotPos({ x: 0, y: 0 });

        for (let i = 0; i < instructions.length; i++) {
            setCurrentInstructionIndex(i);
            const inst = instructions[i];

            for (let s = 0; s < inst.steps; s++) {
                let nextX = currentX;
                let nextY = currentY;

                if (inst.direction === 'UP') nextY--;
                else if (inst.direction === 'DOWN') nextY++;
                else if (inst.direction === 'LEFT') nextX--;
                else if (inst.direction === 'RIGHT') nextX++;

                if (nextX < 0 || nextX >= GRID_WIDTH || nextY < 0 || nextY >= GRID_HEIGHT) {
                    setMessage(`Robot hit a wall!`);
                    await new Promise(r => setTimeout(r, 400));
                    break;
                }

                const cell = grid[nextY][nextX];
                if (cell.type === 'BUILDING') {
                    setMessage(`Robot hit a building!`);
                    await new Promise(r => setTimeout(r, 400));
                    break;
                }

                currentX = nextX;
                currentY = nextY;
                setRobotPos({ x: currentX, y: currentY });
                await new Promise(r => setTimeout(r, 400));
            }
        }

        setIsExecuting(false);
        setCurrentInstructionIndex(-1);

        if (currentX === targetPos.x && currentY === targetPos.y) {
            setScore(s => ({ ...s, won: s.won + 1 }));
            setMessage('SUCCESS!');
        } else {
            setScore(s => ({ ...s, lost: s.lost + 1 }));
            setMessage('FAILURE!');
        }

        setTimeout(() => {
            generateLevel();
        }, 2000);
    };

    return {
        state: { grid, robotPos, targetPos, instructions, isExecuting, currentInstructionIndex, score, message, level },
        actions: { addInstruction, removeInstruction, updateSteps, clearInstructions, runProgram, generateLevel, setLevel }
    };
}
