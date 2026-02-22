import { useState, useCallback, useEffect } from 'react';
import { Vector2 } from '../core/engine';
import { useGameStore } from '../store/gameStore';
import { RobotLogic, Direction, Instruction, CellType, GridCell } from '../games/logic-robot/logic';

// Re-export types that other components might need
export type { Direction, Instruction, CellType, GridCell };

const GAME_ID = 'logic-robot';

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

    // Global Store Actions
    const updateHighScore = useGameStore(state => state.updateHighScore);
    const incrementWins = useGameStore(state => state.incrementWins);
    const incrementPlays = useGameStore(state => state.incrementPlays);

    // Level Generation
    const generateLevel = useCallback(() => {
        const newGrid: GridCell[][] = Array(GRID_HEIGHT).fill(null).map(() =>
            Array(GRID_WIDTH).fill(null).map(() => ({ type: 'GRASS' }))
        );

        const { path } = RobotLogic.generatePath(GRID_WIDTH, GRID_HEIGHT, level);

        newGrid[0][0] = { type: 'START' };

        path.forEach((p, idx) => {
            if (idx === 0) return;
            newGrid[p.y][p.x] = { type: 'PATH' };
        });

        const last = path[path.length - 1];
        newGrid[last.y][last.x] = { type: 'TARGET', buildingType: 'Target' };

        RobotLogic.placeBuildings(newGrid, GRID_WIDTH, GRID_HEIGHT);

        setGrid(newGrid);
        setTargetPos(last);
        setRobotPos({ x: 0, y: 0 });
        setInstructions([]);
        setIsExecuting(false);
        setCurrentInstructionIndex(-1);
        setMessage('Level generated. Plan your route!');
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
        incrementPlays(GAME_ID);

        let currentX = 0;
        let currentY = 0;
        setRobotPos({ x: 0, y: 0 });

        for (let i = 0; i < instructions.length; i++) {
            setCurrentInstructionIndex(i);
            const inst = instructions[i];

            for (let s = 0; s < inst.steps; s++) {
                const nextPos = RobotLogic.calculateNextPosition({ x: currentX, y: currentY }, inst.direction);

                if (nextPos.x < 0 || nextPos.x >= GRID_WIDTH || nextPos.y < 0 || nextPos.y >= GRID_HEIGHT) {
                    setMessage(`Robot hit a wall!`);
                    await new Promise(r => setTimeout(r, 400));
                    break;
                }

                const cell = grid[nextPos.y][nextPos.x];
                if (cell.type === 'BUILDING') {
                    setMessage(`Robot hit a building!`);
                    await new Promise(r => setTimeout(r, 400));
                    break;
                }

                currentX = nextPos.x;
                currentY = nextPos.y;
                setRobotPos({ x: currentX, y: currentY });
                await new Promise(r => setTimeout(r, 400));
            }
        }

        setIsExecuting(false);
        setCurrentInstructionIndex(-1);

        if (currentX === targetPos.x && currentY === targetPos.y) {
            setScore(s => {
                const newWon = s.won + 1;
                updateHighScore(GAME_ID, newWon * 100);
                return { ...s, won: newWon };
            });
            incrementWins(GAME_ID);
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
