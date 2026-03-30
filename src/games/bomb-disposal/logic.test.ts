import { describe, expect, it } from 'vitest';
import { BombDisposalLogic } from './logic';

describe('BombDisposalLogic', () => {
    describe('createRound', () => {
        it('creates one bomb and sets the base round timer for difficulty 1', () => {
            const round = BombDisposalLogic.createRound({
                difficulty: 1,
                roundIndex: 0,
                playerScore: 0,
                machineScore: 0,
            });

            expect(round.bombs).toHaveLength(1);
            expect(round.timeRemainingMs).toBe(20000);
            expect(round.bombs[0].id).toBe('bomb-0-0');
            expect(round.bombs[0].status).toBe('active');
            expect(round.bombs[0].wires.length).toBeGreaterThanOrEqual(3);
        });

        it('creates as many simultaneous bombs as the selected difficulty', () => {
            const round = BombDisposalLogic.createRound({
                difficulty: 3,
                roundIndex: 0,
                playerScore: 0,
                machineScore: 0,
            });

            expect(round.bombs).toHaveLength(3);
            expect(round.timeRemainingMs).toBe(60000);
        });

        it('creates each bomb with exactly one safe wire and one explode wire', () => {
            const round = BombDisposalLogic.createRound({
                difficulty: 2,
                roundIndex: 0,
                playerScore: 0,
                machineScore: 0,
            });

            for (const bomb of round.bombs) {
                const safe = bomb.wires.filter(wire => wire.role === 'safe');
                const explode = bomb.wires.filter(wire => wire.role === 'explode');
                const neutral = bomb.wires.filter(wire => wire.role === 'neutral');

                expect(safe).toHaveLength(1);
                expect(explode).toHaveLength(1);
                expect(neutral.length).toBe(bomb.wires.length - 2);
                expect(bomb.wires.length).toBeGreaterThanOrEqual(3);
            }
        });

        it('keeps wire ids unique within each bomb and uses only defined wire colors', () => {
            const round = BombDisposalLogic.createRound({
                difficulty: 9,
                roundIndex: 2,
                playerScore: 0,
                machineScore: 0,
            });

            for (const bomb of round.bombs) {
                const ids = bomb.wires.map(wire => wire.id);
                const uniqueIds = new Set(ids);

                expect(uniqueIds.size).toBe(ids.length);

                for (const wire of bomb.wires) {
                    expect(wire.color.length).toBeGreaterThan(0);
                }
            }
        });

        it('varies wire counts across rounds for the same difficulty', () => {
            const wireCounts = new Set(
                Array.from({ length: 12 }, (_, roundIndex) =>
                    BombDisposalLogic.createRound({
                        difficulty: 4,
                        roundIndex,
                        playerScore: 0,
                        machineScore: 0,
                    }).bombs[0].wires.length
                )
            );

            expect(wireCounts.size).toBeGreaterThan(1);
        });

        it('clamps difficulty outside the supported 1 to 8 range', () => {
            const lowRound = BombDisposalLogic.createRound({
                difficulty: 0,
                roundIndex: 0,
                playerScore: 0,
                machineScore: 0,
            });

            const highRound = BombDisposalLogic.createRound({
                difficulty: 15,
                roundIndex: 0,
                playerScore: 0,
                machineScore: 0,
            });

            expect(lowRound.bombs).toHaveLength(1);
            expect(lowRound.timeRemainingMs).toBe(20000);
            expect(highRound.bombs).toHaveLength(8);
            expect(highRound.timeRemainingMs).toBe(160000);
        });
    });

    describe('cutWire', () => {
        it('awards a point to the player when cutting the safe wire', () => {
            const round = BombDisposalLogic.createRound({
                difficulty: 1,
                roundIndex: 0,
                playerScore: 0,
                machineScore: 0,
            });
            const bomb = round.bombs[0];
            const safeWire = bomb.wires.find(wire => wire.role === 'safe');

            expect(safeWire).toBeDefined();

            const result = BombDisposalLogic.cutWire(round, bomb.id, safeWire!.id);

            expect(result.playerScoreDelta).toBe(1);
            expect(result.machineScoreDelta).toBe(0);
            expect(result.round.bombs[0].status).toBe('disarmed');
            expect(result.round.bombs[0].wires).toHaveLength(bomb.wires.length - 1);
        });

        it('awards a point to the machine when cutting the explode wire', () => {
            const round = BombDisposalLogic.createRound({
                difficulty: 1,
                roundIndex: 0,
                playerScore: 0,
                machineScore: 0,
            });
            const bomb = round.bombs[0];
            const explodeWire = bomb.wires.find(wire => wire.role === 'explode');

            expect(explodeWire).toBeDefined();

            const result = BombDisposalLogic.cutWire(round, bomb.id, explodeWire!.id);

            expect(result.playerScoreDelta).toBe(0);
            expect(result.machineScoreDelta).toBe(1);
            expect(result.round.bombs[0].status).toBe('exploded');
            expect(result.round.bombs[0].wires).toHaveLength(bomb.wires.length - 1);
        });

        it('does nothing when cutting a neutral wire', () => {
            const round = BombDisposalLogic.createRound({
                difficulty: 3,
                roundIndex: 0,
                playerScore: 0,
                machineScore: 0,
            });
            const bomb = round.bombs.find(candidate =>
                candidate.wires.some(wire => wire.role === 'neutral')
            );
            const neutralWire = bomb?.wires.find(wire => wire.role === 'neutral');

            expect(bomb).toBeDefined();
            expect(neutralWire).toBeDefined();

            const result = BombDisposalLogic.cutWire(round, bomb!.id, neutralWire!.id);

            expect(result.playerScoreDelta).toBe(0);
            expect(result.machineScoreDelta).toBe(0);
            expect(result.round.bombs.find(candidate => candidate.id === bomb!.id)?.status).toBe('active');
            expect(result.round.bombs.find(candidate => candidate.id === bomb!.id)?.wires).toHaveLength(bomb!.wires.length - 1);
        });
    });

    describe('round progression', () => {
        it('explodes all active bombs when the timer runs out', () => {
            const round = BombDisposalLogic.createRound({
                difficulty: 2,
                roundIndex: 0,
                playerScore: 0,
                machineScore: 0,
            });

            const result = BombDisposalLogic.expireRound(round);

            expect(result.machineScoreDelta).toBe(2);
            expect(result.round.bombs.every(bomb => bomb.status === 'exploded')).toBe(true);
        });

        it('detects when all bombs in the round are resolved', () => {
            let round = BombDisposalLogic.createRound({
                difficulty: 1,
                roundIndex: 0,
                playerScore: 0,
                machineScore: 0,
            });
            const bomb = round.bombs[0];
            const safeWire = bomb.wires.find(wire => wire.role === 'safe');

            expect(safeWire).toBeDefined();

            round = BombDisposalLogic.cutWire(round, bomb.id, safeWire!.id).round;

            expect(BombDisposalLogic.isRoundResolved(round)).toBe(true);
        });
    });

    describe('match status', () => {
        it('finishes the match when the player reaches the target score', () => {
            expect(
                BombDisposalLogic.getMatchStatus({
                    difficulty: 2,
                    playerScore: 3,
                    machineScore: 0,
                    roundsPlayed: 1,
                }).state
            ).toBe('player-won');
        });

        it('finishes the match when the machine reaches the target score', () => {
            expect(
                BombDisposalLogic.getMatchStatus({
                    difficulty: 3,
                    playerScore: 0,
                    machineScore: 4,
                    roundsPlayed: 2,
                }).state
            ).toBe('machine-won');
        });

        it('finishes the match early when the trailing side cannot win or tie with the rounds left', () => {
            const status = BombDisposalLogic.getMatchStatus({
                difficulty: 5,
                playerScore: 4,
                machineScore: 1,
                roundsPlayed: 4,
            });

            expect(status.state).toBe('player-won');
            expect(status.reason).toBe('mathematical-elimination');
        });
    });
});
