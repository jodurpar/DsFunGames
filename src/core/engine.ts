/**
 * Common types and utilities for the DsFunGames engine.
 * Following Software Architecture & Senior Engineering best practices.
 */

export type Owner = 'player' | 'ai' | 'player1' | 'player2' | 'neutral' | null;

export interface Vector2 {
    x: number;
    y: number;
}

/**
 * Universal game state for simple arcade/strategy games
 */
export interface GameState {
    status: 'idle' | 'playing' | 'paused' | 'gameover';
    winner: Owner | 'draw' | null;
    score: Record<string, number>;
    wave?: number;
}

/**
 * Common math utilities for grid-based games
 */
export const GameMath = {
    distance: (p1: Vector2, p2: Vector2): number => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    },

    lerp: (start: number, end: number, t: number): number => {
        return start + (end - start) * t;
    },

    clampedLerp: (start: number, end: number, t: number): number => {
        return Math.max(start, Math.min(end, GameMath.lerp(start, end, t)));
    },

    getRandomInt: (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

/**
 * Standardized Game Loop abstraction
 */
export class GameLoop {
    private rafId: number | null = null;
    private lastTime: number = 0;
    private onTick: (deltaTime: number, timestamp: number) => void;

    constructor(onTick: (deltaTime: number, timestamp: number) => void) {
        this.onTick = onTick;
    }

    start() {
        this.lastTime = performance.now();
        const loop = (timestamp: number) => {
            const deltaTime = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;
            this.onTick(deltaTime, timestamp);
            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
    }

    stop() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}
