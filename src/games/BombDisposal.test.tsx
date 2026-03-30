import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BombDisposal from './BombDisposal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { value?: number; count?: number }) => {
      if (key === 'bombDisposal.difficultyValue' && typeof options?.value === 'number') {
        return `Difficulty ${options.value}`;
      }

      if (key === 'bombDisposal.wiresCount' && typeof options?.count === 'number') {
        return `${options.count} wires`;
      }

      return key;
    },
  }),
}));

vi.mock('./bomb-disposal/logic', () => {
  const createRound = () => ({
    bombs: [
      {
        id: 'bomb-0-0',
        status: 'active',
        wires: [
          { id: 'wire-safe', color: 'green', role: 'safe' },
          { id: 'wire-explode', color: 'red', role: 'explode' },
          { id: 'wire-neutral', color: 'blue', role: 'neutral' },
        ],
      },
    ],
    timeRemainingMs: 20_000,
  });

  return {
    BombDisposalLogic: {
      createRound,
      cutWire: (round: ReturnType<typeof createRound>, bombId: string, wireId: string) => {
        const bomb = round.bombs.find(candidate => candidate.id === bombId)!;
        const wire = bomb.wires.find(candidate => candidate.id === wireId)!;
        const nextBomb = {
          ...bomb,
          status: wire.role === 'safe' ? 'disarmed' : wire.role === 'explode' ? 'exploded' : 'active',
          wires: bomb.wires.filter(candidate => candidate.id !== wireId),
        };

        return {
          round: { ...round, bombs: [nextBomb] },
          playerScoreDelta: wire.role === 'safe' ? 1 : 0,
          machineScoreDelta: wire.role === 'explode' ? 1 : 0,
        };
      },
      expireRound: (round: ReturnType<typeof createRound>) => ({
        round: {
          ...round,
          bombs: round.bombs.map(bomb => ({ ...bomb, status: 'exploded' as const })),
        },
        playerScoreDelta: 0,
        machineScoreDelta: round.bombs.length,
      }),
      isRoundResolved: (round: ReturnType<typeof createRound>) =>
        round.bombs.every(bomb => bomb.status !== 'active'),
      getMatchStatus: (input: { roundsPlayed: number }) => {
        if (input.roundsPlayed >= 1) {
          return {
            state: 'player-won' as const,
            reason: 'target-score' as const,
            targetScore: 2,
            roundsRemaining: 0,
          };
        }

        return {
          state: 'in-progress' as const,
          reason: null,
          targetScore: 2,
          roundsRemaining: 2,
        };
      },
    },
  };
});

describe('BombDisposal', () => {
  it('renders difficulty options from 1 to 8 only', () => {
    render(<BombDisposal />);

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('option', { name: '1' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('option', { name: '8' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('option', { name: '9' })).not.toBeInTheDocument();
  });

  it('updates the visible difficulty when the select changes', () => {
    render(<BombDisposal />);

    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '4' } });

    expect(screen.getByText('Difficulty 4')).toBeInTheDocument();
  });

  it('shows the boom state after cutting an explode wire', () => {
    vi.useFakeTimers();
    render(<BombDisposal />);

    const wireButtons = screen.getAllByLabelText('bombDisposal.cutWire');
    fireEvent.click(wireButtons[1]);

    expect(screen.getByText('bombDisposal.boom')).toBeInTheDocument();
    expect(screen.getByText('bombDisposal.roundSummaryTitle')).toBeInTheDocument();
    expect(screen.getByText('bombDisposal.disarmedCount')).toBeInTheDocument();
    expect(screen.getByText('bombDisposal.explodedCount')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    expect(screen.getByText('bombDisposal.boom')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1_500);
    });
    vi.useRealTimers();
  });

  it('uses a single-row grid for difficulties up to 4', () => {
    render(<BombDisposal />);

    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '4' } });

    const grid = screen.getByTestId('bomb-grid');
    expect(grid.getAttribute('data-grid-mode')).toBe('single-row');
    expect(grid.style.gridTemplateColumns).toBe('repeat(4, minmax(0, 1fr))');
  });

  it('uses a two-row grid from difficulty 5 onwards', () => {
    render(<BombDisposal />);

    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '5' } });

    const grid = screen.getByTestId('bomb-grid');
    expect(grid.getAttribute('data-grid-mode')).toBe('double-row');
    expect(grid.style.gridTemplateColumns).toBe('repeat(4, minmax(0, 1fr))');
  });

  it('keeps the round result visible for five seconds before advancing', () => {
    vi.useFakeTimers();
    render(<BombDisposal />);

    const wireButtons = screen.getAllByLabelText('bombDisposal.cutWire');
    fireEvent.click(wireButtons[1]);

    expect(screen.getByText('bombDisposal.boom')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4_900);
    });
    expect(screen.getByText('bombDisposal.boom')).toBeInTheDocument();
    expect(screen.getByText('bombDisposal.roundSummaryTitle')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('shows a time expired message when the round ends by timeout', () => {
    vi.useFakeTimers();
    render(<BombDisposal />);

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(screen.getByText('bombDisposal.timeExpired')).toBeInTheDocument();
    expect(screen.getByText('bombDisposal.roundSummaryTitle')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
