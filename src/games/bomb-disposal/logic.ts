export interface CreateRoundInput {
  difficulty: number;
  roundIndex: number;
  playerScore: number;
  machineScore: number;
}

export interface BombWire {
  id: string;
  color: string;
  role: 'safe' | 'explode' | 'neutral';
}

export interface BombState {
  id: string;
  status: 'active' | 'disarmed' | 'exploded';
  wires: BombWire[];
}

export interface RoundState {
  bombs: BombState[];
  timeRemainingMs: number;
}

export interface WireCutResult {
  round: RoundState;
  playerScoreDelta: number;
  machineScoreDelta: number;
}

export interface MatchStatusInput {
  difficulty: number;
  playerScore: number;
  machineScore: number;
  roundsPlayed: number;
}

export interface MatchStatus {
  state: 'in-progress' | 'player-won' | 'machine-won';
  reason: 'target-score' | 'mathematical-elimination' | null;
  targetScore: number;
  roundsRemaining: number;
}

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 8;
const MAX_WIRES = 9;
const WIRE_COLORS = [
  'red',
  'blue',
  'yellow',
  'green',
  'orange',
  'purple',
  'white',
  'black',
  'cyan',
] as const;

function clampDifficulty(difficulty: number): number {
  if (!Number.isFinite(difficulty)) {
    return MIN_DIFFICULTY;
  }

  return Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, Math.trunc(difficulty)));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createWires(difficulty: number, roundIndex: number, bombIndex: number): BombWire[] {
  const minWireCount = Math.min(MAX_WIRES, Math.max(3, difficulty + 1));
  const maxWireCount = Math.min(MAX_WIRES, minWireCount + 2);
  const wireCount = randomInt(minWireCount, maxWireCount);
  const wires = WIRE_COLORS.slice(0, wireCount).map((color, wireIndex) => ({
    id: `wire-${roundIndex}-${bombIndex}-${wireIndex}`,
    color,
    role: 'neutral' as const,
  }));
  const safeIndex = randomInt(0, wireCount - 1);
  let explodeIndex = randomInt(0, wireCount - 1);

  while (explodeIndex === safeIndex) {
    explodeIndex = randomInt(0, wireCount - 1);
  }

  wires[safeIndex] = { ...wires[safeIndex], role: 'safe' };
  wires[explodeIndex] = { ...wires[explodeIndex], role: 'explode' };

  return wires;
}

export const BombDisposalLogic = {
  createRound(input: CreateRoundInput): RoundState {
    const difficulty = clampDifficulty(input.difficulty);

    return {
      bombs: Array.from({ length: difficulty }, (_, bombIndex) => ({
          id: `bomb-${input.roundIndex}-${bombIndex}`,
          status: 'active',
          wires: createWires(difficulty, input.roundIndex, bombIndex),
        })),
      timeRemainingMs: difficulty * 20_000,
    };
  },

  cutWire(round: RoundState, bombId: string, wireId: string): WireCutResult {
    let playerScoreDelta = 0;
    let machineScoreDelta = 0;

    const bombs = round.bombs.map((bomb) => {
      if (bomb.id !== bombId || bomb.status !== 'active') {
        return bomb;
      }

      const wire = bomb.wires.find((candidate) => candidate.id === wireId);
      if (!wire) {
        return bomb;
      }

      const remainingWires = bomb.wires.filter((candidate) => candidate.id !== wireId);

      if (wire.role === 'safe') {
        playerScoreDelta = 1;
        return {
          ...bomb,
          status: 'disarmed',
          wires: remainingWires,
        };
      }

      if (wire.role === 'explode') {
        machineScoreDelta = 1;
        return {
          ...bomb,
          status: 'exploded',
          wires: remainingWires,
        };
      }

      return {
        ...bomb,
        wires: remainingWires,
      };
    });

    return {
      round: {
        ...round,
        bombs,
      },
      playerScoreDelta,
      machineScoreDelta,
    };
  },

  expireRound(round: RoundState): WireCutResult {
    let machineScoreDelta = 0;

    const bombs = round.bombs.map((bomb) => {
      if (bomb.status !== 'active') {
        return bomb;
      }

      machineScoreDelta += 1;
      return {
        ...bomb,
        status: 'exploded',
      };
    });

    return {
      round: {
        ...round,
        bombs,
      },
      playerScoreDelta: 0,
      machineScoreDelta,
    };
  },

  isRoundResolved(round: RoundState): boolean {
    return round.bombs.every((bomb) => bomb.status !== 'active');
  },

  getMatchStatus(input: MatchStatusInput): MatchStatus {
    const difficulty = clampDifficulty(input.difficulty);
    const targetScore = difficulty + 1;
    const maxRounds = targetScore;
    const roundsRemaining = Math.max(0, maxRounds - input.roundsPlayed);

    if (input.playerScore >= targetScore) {
      return {
        state: 'player-won',
        reason: 'target-score',
        targetScore,
        roundsRemaining,
      };
    }

    if (input.machineScore >= targetScore) {
      return {
        state: 'machine-won',
        reason: 'target-score',
        targetScore,
        roundsRemaining,
      };
    }

    if (input.playerScore > input.machineScore && input.machineScore + roundsRemaining < input.playerScore) {
      return {
        state: 'player-won',
        reason: 'mathematical-elimination',
        targetScore,
        roundsRemaining,
      };
    }

    if (input.machineScore > input.playerScore && input.playerScore + roundsRemaining < input.machineScore) {
      return {
        state: 'machine-won',
        reason: 'mathematical-elimination',
        targetScore,
        roundsRemaining,
      };
    }

    return {
      state: 'in-progress',
      reason: null,
      targetScore,
      roundsRemaining,
    };
  },
};
