import { create } from 'zustand';
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware';

interface GameStats {
    highScore: number;
    plays: number;
    wins: number;
}

interface UserSettings {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
}

export interface GameState {
    user: {
        name: string;
        isGuest: boolean;
    };
    stats: Record<string, GameStats>;
    settings: UserSettings;
}

export interface GameActions {
    updateHighScore: (gameId: string, score: number) => void;
    incrementPlays: (gameId: string) => void;
    incrementWins: (gameId: string) => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
    setUserName: (name: string) => void;
}

export type GameStore = GameState & GameActions;

const initialStats: GameStats = { highScore: 0, plays: 0, wins: 0 };

/**
 * Global store for DsFunGames using Zustand.
 * recommendation 1: Implementation of Global State Management Configuration.
 */
export const useGameStore = create<GameStore>()(
    subscribeWithSelector(
        persist(
            (set) => ({
                user: { name: 'Player One', isGuest: true },
                stats: {},
                settings: {
                    soundEnabled: true,
                    vibrationEnabled: true,
                    theme: 'light',
                },

                setUserName: (name) => set((state) => ({ user: { ...state.user, name, isGuest: false } })),

                updateHighScore: (gameId, score) => set((state) => {
                    const currentStats = state.stats[gameId] || { ...initialStats };
                    if (score > currentStats.highScore) {
                        return {
                            stats: {
                                ...state.stats,
                                [gameId]: { ...currentStats, highScore: score }
                            }
                        };
                    }
                    return state;
                }),

                incrementPlays: (gameId) => set((state) => {
                    const currentStats = state.stats[gameId] || { ...initialStats };
                    const newStats = {
                        stats: {
                            ...state.stats,
                            [gameId]: { ...currentStats, plays: (currentStats.plays || 0) + 1 }
                        }
                    };
                    return newStats;
                }),

                incrementWins: (gameId) => set((state) => {
                    const currentStats = state.stats[gameId] || { ...initialStats };
                    return {
                        stats: {
                            ...state.stats,
                            [gameId]: { ...currentStats, wins: (currentStats.wins || 0) + 1 }
                        }
                    };
                }),

                updateSettings: (newSettings) => set((state) => ({
                    settings: { ...state.settings, ...newSettings }
                })),
            }),
            {
                name: 'ds-fungames-storage',
                storage: createJSONStorage(() => localStorage),
            }
        )
    )
);
