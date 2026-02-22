import { useState, useEffect, useCallback, useRef } from 'react';
import { TDLogic } from '../games/tower-defense/logic';
import { useGameStore } from '../store/gameStore';

export interface Position {
    x: number;
    y: number;
}

export interface Enemy {
    id: number;
    pos: Position;
    pathIndex: number;
    health: number;
    maxHealth: number;
    speed: number;
}

export interface Tower {
    id: number;
    pos: Position;
    range: number;
    damage: number;
    lastShot: number;
}

export interface Projectile {
    id: number;
    start: Position;
    target: Position;
    progress: number;
}

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 8;
export const CELL_SIZE = 60;
export const TOWER_COST = 50;
const GAME_ID = 'tower-defense-lite';

/**
 * Hook to manage the Tower Defense game engine.
 * recommendation 2: Refactored using TDLogic helper.
 */
export function useTowerDefenseEngine() {
    const [path, setPath] = useState<Position[]>(() => TDLogic.generateRandomPath(GRID_WIDTH, GRID_HEIGHT));
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [towers, setTowers] = useState<Tower[]>([]);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [money, setMoney] = useState(150);
    const [health, setHealth] = useState(20);
    const [wave, setWave] = useState(0);
    const [gameActive, setGameActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    // Global Store Actions
    const updateHighScore = useGameStore(state => state.updateHighScore);
    const incrementWins = useGameStore(state => state.incrementWins);
    const incrementPlays = useGameStore(state => state.incrementPlays);

    const gameLoopRef = useRef<number | null>(null);
    const lastTickRef = useRef<number>(0);
    const enemyIdCounter = useRef(0);
    const towerIdCounter = useRef(0);
    const projectileIdCounter = useRef(0);

    const isPath = (x: number, y: number) => path.some(p => p.x === x && p.y === y);
    const hasTower = (x: number, y: number) => towers.some(t => t.pos.x === x && t.pos.y === y);

    const placeTower = (x: number, y: number) => {
        if (isPath(x, y) || hasTower(x, y) || money < TOWER_COST || gameOver) return;
        const newTower: Tower = {
            id: towerIdCounter.current++,
            pos: { x, y },
            range: 2.5,
            damage: 15,
            lastShot: 0,
        };
        setTowers([...towers, newTower]);
        setMoney(m => m - TOWER_COST);
    };

    const resetGame = () => {
        setPath(TDLogic.generateRandomPath(GRID_WIDTH, GRID_HEIGHT));
        setEnemies([]);
        setTowers([]);
        setProjectiles([]);
        setMoney(150);
        setHealth(20);
        setWave(0);
        setScore(0);
        setGameActive(false);
        setGameOver(false);
        lastTickRef.current = 0;
    };

    const startNextWave = () => {
        if (wave === 0) {
            setWave(1);
            incrementPlays(GAME_ID);
        }
    };

    const gameTick = useCallback((timestamp: number) => {
        if (!gameActive || gameOver) return;

        if (lastTickRef.current === 0) {
            lastTickRef.current = timestamp;
        }

        const delta = timestamp - lastTickRef.current;
        lastTickRef.current = timestamp;

        // dt is 1.0 at 60 FPS (16.66ms per frame). Cap at 3 for lag spikes.
        const dt = Math.min(delta, 50) / 16.666;

        setEnemies(prevEnemies => {
            const updatedEnemies: Enemy[] = [];
            let healthLost = 0;

            prevEnemies.forEach(enemy => {
                const nextIdx = enemy.pathIndex + (enemy.speed * 10) * dt;

                if (nextIdx >= path.length * 10) {
                    healthLost += 1;
                } else if (enemy.health > 0) {
                    const pos = TDLogic.calculateEnemyPosition(path, nextIdx);
                    updatedEnemies.push({
                        ...enemy,
                        pos,
                        pathIndex: nextIdx,
                    });
                }
            });

            if (healthLost > 0) {
                setHealth(h => {
                    const newH = Math.max(0, h - healthLost);
                    if (newH === 0) {
                        setGameOver(true);
                        updateHighScore(GAME_ID, score);
                    }
                    return newH;
                });
            }
            return updatedEnemies;
        });

        const currentCooldown = 500;
        const currentProjSpeed = 0.05 * dt;

        setTowers(prevTowers => {
            const newTowers = [...prevTowers];
            const newProjectiles: Projectile[] = [];

            newTowers.forEach(tower => {
                if (timestamp - tower.lastShot < currentCooldown) return;

                const target = enemies.find(e => {
                    return TDLogic.isInRange(e.pos, tower.pos, tower.range) && e.pathIndex >= 0;
                });

                if (target) {
                    tower.lastShot = timestamp;
                    newProjectiles.push({
                        id: projectileIdCounter.current++,
                        start: { ...tower.pos },
                        target: { ...target.pos },
                        progress: 0
                    });

                    setEnemies(prev => prev.map(e => {
                        if (e.id === target.id) {
                            const newH = e.health - tower.damage;
                            if (newH <= 0) {
                                setMoney(m => m + 15);
                                setScore(s => s + 10);
                            }
                            return { ...e, health: newH };
                        }
                        return e;
                    }).filter(e => e.health > 0));
                }
            });

            if (newProjectiles.length > 0) setProjectiles(p => [...p, ...newProjectiles]);
            return newTowers;
        });

        setProjectiles(prev => prev.map(p => ({
            ...p,
            progress: p.progress + currentProjSpeed
        })).filter(p => p.progress < 1));

        gameLoopRef.current = requestAnimationFrame(gameTick);
    }, [gameActive, gameOver, enemies, wave, path, score, updateHighScore, incrementPlays]);

    useEffect(() => {
        if (wave > 0 && !gameOver) {
            const enemyCount = 5 + wave * 2;
            const newEnemies: Enemy[] = [];
            for (let i = 0; i < enemyCount; i++) {
                newEnemies.push({
                    id: enemyIdCounter.current++,
                    pos: { ...path[0] },
                    pathIndex: -i * 10,
                    health: 30 + wave * 15,
                    maxHealth: 30 + wave * 15,
                    speed: 0.025,
                });
            }
            setEnemies(newEnemies);
            lastTickRef.current = 0;
            setGameActive(true);

            // Increment wins per wave or just once at certain milestones?
            // Let's assume clearing a wave is a minor "win".
            if (wave > 1) incrementWins(GAME_ID);
        }
    }, [wave, gameOver, path, incrementWins]);

    useEffect(() => {
        if (gameActive && enemies.length === 0 && !gameOver && wave > 0) {
            const timer = setTimeout(() => {
                setWave(w => w + 1);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [enemies.length, wave, gameOver, gameActive]);

    useEffect(() => {
        if (gameActive && !gameOver) {
            gameLoopRef.current = requestAnimationFrame(gameTick);
        } else if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
        }
        return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
    }, [gameActive, gameOver, gameTick]);

    const regeneratePath = () => {
        if (wave === 0 && towers.length === 0) {
            setPath(TDLogic.generateRandomPath(GRID_WIDTH, GRID_HEIGHT));
        }
    };

    return {
        state: {
            enemies,
            towers,
            projectiles,
            money,
            health,
            wave,
            score,
            gameActive,
            gameOver,
            path
        },
        actions: {
            placeTower,
            resetGame,
            startNextWave,
            regeneratePath
        },
        utils: {
            isPath,
            hasTower
        },
        config: {
            GRID_WIDTH,
            GRID_HEIGHT,
            CELL_SIZE
        }
    };
}
