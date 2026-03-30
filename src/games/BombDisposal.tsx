import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Flame, RefreshCw, Scissors, Shield, Skull, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  BombDisposalLogic,
  type MatchStatus,
  type RoundState,
} from './bomb-disposal/logic';

interface MatchState {
  difficulty: number;
  playerScore: number;
  machineScore: number;
  roundIndex: number;
  round: RoundState;
  matchStatus: MatchStatus;
  pendingAdvance: boolean;
  roundSummary: RoundSummary | null;
}

interface RoundSummary {
  disarmedCount: number;
  explodedCount: number;
  reason: 'resolved' | 'timeout';
  countdownSeconds: number;
}

const SCISSORS_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='8' cy='9' r='4.5' fill='none' stroke='%230f172a' stroke-width='2'/><circle cx='8' cy='23' r='4.5' fill='none' stroke='%230f172a' stroke-width='2'/><path d='M12 11 27 4M12 21 27 28M12 11l15 17M12 21 27 4' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>") 6 6, pointer`;

const WIRE_COLORS: Record<string, string> = {
  red: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
  blue: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
  yellow: 'linear-gradient(180deg, #fde047 0%, #eab308 100%)',
  green: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)',
  orange: 'linear-gradient(180deg, #fb923c 0%, #ea580c 100%)',
  purple: 'linear-gradient(180deg, #c084fc 0%, #9333ea 100%)',
  white: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
  black: 'linear-gradient(180deg, #334155 0%, #020617 100%)',
  cyan: 'linear-gradient(180deg, #67e8f9 0%, #0891b2 100%)',
};

const MAX_DIFFICULTY = 8;

function createMatchState(difficulty: number): MatchState {
  const round = BombDisposalLogic.createRound({
    difficulty,
    roundIndex: 0,
    playerScore: 0,
    machineScore: 0,
  });

  return {
    difficulty,
    playerScore: 0,
    machineScore: 0,
    roundIndex: 0,
    round,
    roundSummary: null,
    pendingAdvance: false,
    matchStatus: BombDisposalLogic.getMatchStatus({
      difficulty,
      playerScore: 0,
      machineScore: 0,
      roundsPlayed: 0,
    }),
  };
}

function formatSeconds(timeRemainingMs: number): string {
  return Math.max(0, Math.ceil(timeRemainingMs / 1000)).toString().padStart(2, '0');
}

function getGridColumns(difficulty: number): number {
  return difficulty <= 4 ? difficulty : 4;
}

function summarizeRound(round: RoundState, reason: RoundSummary['reason']): RoundSummary {
  return {
    disarmedCount: round.bombs.filter((bomb) => bomb.status === 'disarmed').length,
    explodedCount: round.bombs.filter((bomb) => bomb.status === 'exploded').length,
    reason,
    countdownSeconds: 5,
  };
}

export default function BombDisposal() {
  const { t } = useTranslation();
  const [matchState, setMatchState] = useState<MatchState>(() => createMatchState(1));

  const applyRoundResult = (
    currentState: MatchState,
    nextRound: RoundState,
    playerScoreDelta: number,
    machineScoreDelta: number,
    summaryReason: RoundSummary['reason'] = 'resolved'
  ): MatchState => {
    const playerScore = currentState.playerScore + playerScoreDelta;
    const machineScore = currentState.machineScore + machineScoreDelta;

    const immediateStatus = BombDisposalLogic.getMatchStatus({
      difficulty: currentState.difficulty,
      playerScore,
      machineScore,
      roundsPlayed: currentState.roundIndex,
    });

    if (immediateStatus.state !== 'in-progress') {
      return {
        ...currentState,
        playerScore,
        machineScore,
        round: nextRound,
        roundSummary: null,
        pendingAdvance: false,
        matchStatus: immediateStatus,
      };
    }

    if (!BombDisposalLogic.isRoundResolved(nextRound)) {
      return {
        ...currentState,
        playerScore,
        machineScore,
        round: nextRound,
        roundSummary: null,
        pendingAdvance: false,
      };
    }

    const roundsPlayed = currentState.roundIndex + 1;
    const statusAfterRound = BombDisposalLogic.getMatchStatus({
      difficulty: currentState.difficulty,
      playerScore,
      machineScore,
      roundsPlayed,
    });

    if (statusAfterRound.state !== 'in-progress') {
      return {
        ...currentState,
        playerScore,
        machineScore,
        round: nextRound,
        roundSummary: summarizeRound(nextRound, summaryReason),
        pendingAdvance: false,
        matchStatus: statusAfterRound,
      };
    }

    return {
      ...currentState,
      difficulty: currentState.difficulty,
      playerScore,
      machineScore,
      round: nextRound,
      roundSummary: summarizeRound(nextRound, summaryReason),
      pendingAdvance: true,
      matchStatus: statusAfterRound,
    };
  };

  const criticalTimer = matchState.round.timeRemainingMs <= 5_000;
  const victoryTarget = matchState.difficulty + 1;
  const matchFinished = matchState.matchStatus.state !== 'in-progress';
  const singleRowLayout = matchState.difficulty <= 4;
  const gridColumns = getGridColumns(matchState.difficulty);

  const statusLabel = useMemo(() => {
    if (matchState.matchStatus.state === 'player-won') {
      return t('bombDisposal.playerWon');
    }

    if (matchState.matchStatus.state === 'machine-won') {
      return t('bombDisposal.machineWon');
    }

    return t('bombDisposal.operationActive');
  }, [matchState.matchStatus.state, t]);

  useEffect(() => {
    if (matchFinished) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setMatchState((currentState) => {
        if (currentState.matchStatus.state !== 'in-progress') {
          return currentState;
        }

        if (currentState.round.timeRemainingMs <= 1_000) {
          const result = BombDisposalLogic.expireRound(currentState.round);
          return applyRoundResult(
            currentState,
            result.round,
            result.playerScoreDelta,
            result.machineScoreDelta,
            'timeout'
          );
        }

        return {
          ...currentState,
          round: {
            ...currentState.round,
            timeRemainingMs: currentState.round.timeRemainingMs - 1_000,
          },
        };
      });
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [matchFinished]);

  useEffect(() => {
    if (!matchState.pendingAdvance || matchFinished) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMatchState((currentState) => {
        if (!currentState.pendingAdvance || currentState.matchStatus.state !== 'in-progress') {
          return currentState;
        }

        const nextRoundIndex = currentState.roundIndex + 1;
        return {
          ...currentState,
          roundIndex: nextRoundIndex,
          round: BombDisposalLogic.createRound({
            difficulty: currentState.difficulty,
            roundIndex: nextRoundIndex,
            playerScore: currentState.playerScore,
            machineScore: currentState.machineScore,
          }),
          roundSummary: null,
          pendingAdvance: false,
        };
      });
    }, 5_000);

    return () => window.clearTimeout(timeoutId);
  }, [matchFinished, matchState.pendingAdvance]);

  useEffect(() => {
    if (!matchState.roundSummary) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setMatchState((currentState) => {
        if (!currentState.roundSummary) {
          return currentState;
        }

        return {
          ...currentState,
          roundSummary: {
            ...currentState.roundSummary,
            countdownSeconds: Math.max(0, currentState.roundSummary.countdownSeconds - 1),
          },
        };
      });
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [matchState.roundSummary]);

  const handleDifficultyChange = (difficulty: number) => {
    setMatchState(createMatchState(difficulty));
  };

  const handleRestart = () => {
    setMatchState(createMatchState(matchState.difficulty));
  };

  const handleWireCut = (bombId: string, wireId: string) => {
    if (matchFinished) {
      return;
    }

    setMatchState((currentState) => {
      const result = BombDisposalLogic.cutWire(currentState.round, bombId, wireId);
      return applyRoundResult(
        currentState,
        result.round,
        result.playerScoreDelta,
        result.machineScoreDelta
      );
    });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 sm:gap-10 w-full mx-auto justify-center items-start pb-20">
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6 sticky top-24 order-2 xl:order-1">
        <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] flex flex-col gap-6">
          <div className="flex items-center gap-3 text-game-accent">
            <div className="bg-game-accent/10 p-2 rounded-xl">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">{t('bombDisposal.guideTitle')}</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-game-accent/5 p-4 rounded-2xl border border-game-accent/10">
              <p className="text-[13px] text-game-text font-semibold leading-relaxed">
                {t('bombDisposal.mainGoal')}
              </p>
            </div>

            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-game-accent/10 flex items-center justify-center text-xs font-black text-game-accent shrink-0">
                  {step}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-game-text">{t(`bombDisposal.step${step}Title`)}</h4>
                  <p className="text-[12px] text-game-muted leading-relaxed">
                    {t(`bombDisposal.step${step}Desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-game-border space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-medium text-game-muted italic">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>{t('bombDisposal.tip')}</span>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-game-border p-4">
              <label htmlFor="bomb-disposal-difficulty" className="block text-[10px] font-black uppercase tracking-widest text-game-muted mb-2">
                {t('bombDisposal.selectDifficulty')}
              </label>
              <select
                id="bomb-disposal-difficulty"
                value={matchState.difficulty}
                onChange={(event) => handleDifficultyChange(Number(event.target.value))}
                className="premium-input w-full h-12 text-sm font-black"
              >
                {Array.from({ length: MAX_DIFFICULTY }, (_, index) => index + 1).map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl flex flex-col gap-6 sm:gap-8 items-center order-1 xl:order-2">
        <div className="w-full glass-card p-4 sm:p-6 rounded-[2.5rem] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex flex-wrap items-center gap-5 sm:gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">
                {t('bombDisposal.scoreboard')}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                  <span className="font-black text-2xl text-game-text font-mono">{matchState.playerScore}</span>
                </div>
                <div className="w-px h-6 bg-game-border" />
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.35)]" />
                  <span className="font-black text-2xl text-game-text font-mono">{matchState.machineScore}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">
                {t('bombDisposal.target')}
              </span>
              <span className="font-black text-2xl text-game-accent font-mono">{victoryTarget}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">
                {t('bombDisposal.roundLabel')}
              </span>
              <span className="font-black text-2xl text-game-text font-mono">{matchState.roundIndex + 1}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="min-w-[170px]">
              <label
                htmlFor="bomb-disposal-difficulty-header"
                className="block text-[10px] font-bold uppercase tracking-widest text-game-muted mb-1"
              >
                {t('bombDisposal.selectDifficulty')}
              </label>
              <select
                id="bomb-disposal-difficulty-header"
                value={matchState.difficulty}
                onChange={(event) => handleDifficultyChange(Number(event.target.value))}
                className="premium-input w-full h-12 text-sm font-black bg-white"
              >
                {Array.from({ length: MAX_DIFFICULTY }, (_, index) => index + 1).map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`rounded-[1.75rem] border px-5 py-3 min-w-[132px] ${
                criticalTimer
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-slate-50 border-game-border text-game-text'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">
                {t('bombDisposal.timer')}
              </div>
              <div className="font-black text-3xl font-mono leading-none">{formatSeconds(matchState.round.timeRemainingMs)}</div>
            </div>

            <button
              onClick={handleRestart}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-game-border text-game-muted active:scale-95"
              aria-label={t('bombDisposal.restartMission')}
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="w-full relative p-4 sm:p-6 lg:p-8 bg-white rounded-[3rem] shadow-2xl border border-game-border overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_48%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(transparent_95%,rgba(148,163,184,0.08)_100%),linear-gradient(90deg,transparent_95%,rgba(148,163,184,0.08)_100%)] bg-[size:28px_28px] pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-end">
              <div className="text-[11px] font-bold uppercase tracking-widest text-game-muted">
                {t('bombDisposal.difficultyValue', { value: matchState.difficulty })}
              </div>
            </div>

            <div
              data-testid="bomb-grid"
              data-grid-mode={singleRowLayout ? 'single-row' : 'double-row'}
              className="grid gap-3 sm:gap-4"
              style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
            >
              <AnimatePresence mode="popLayout">
                {matchState.round.bombs.map((bomb) => {
                  const resolved = bomb.status !== 'active';
                  const compactBomb = matchState.difficulty >= 4;
                  const ultraCompactBomb = matchState.difficulty >= 5;

                  return (
                    <motion.div
                      key={bomb.id}
                      layout
                      initial={{ opacity: 0, y: 24, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -18, scale: 0.96 }}
                      className={`relative rounded-[2.25rem] border overflow-hidden ${
                        bomb.status === 'disarmed'
                          ? 'border-emerald-200 bg-emerald-50/80'
                          : bomb.status === 'exploded'
                            ? 'border-red-200 bg-red-50/80'
                            : 'border-slate-200 bg-slate-50/80'
                      }`}
                    >
                      <div className="absolute inset-x-5 top-0 h-4 rounded-b-2xl bg-slate-800/90" />
                      <div className={`${ultraCompactBomb ? 'px-2.5 sm:px-3 pt-3 pb-2' : compactBomb ? 'px-3 sm:px-4 pt-4 pb-2.5' : 'px-4 sm:px-5 pt-5 pb-3'}`}>
                        <div className={`flex items-start justify-center ${ultraCompactBomb ? 'gap-1 sm:gap-1.5 min-h-[64px]' : compactBomb ? 'gap-1.5 sm:gap-2 min-h-[84px]' : 'gap-2 sm:gap-3 min-h-[128px]'} mb-2`}>
                          {bomb.wires.map((wire) => (
                            <button
                              key={wire.id}
                              onClick={() => handleWireCut(bomb.id, wire.id)}
                              disabled={resolved || matchFinished}
                              aria-label={t('bombDisposal.cutWire')}
                              className="group flex flex-col items-center disabled:cursor-not-allowed"
                              style={{ cursor: resolved || matchFinished ? 'not-allowed' : SCISSORS_CURSOR }}
                            >
                              <span className={`${ultraCompactBomb ? 'w-2.5 h-2.5 mb-0.5' : compactBomb ? 'w-3 h-3 mb-1' : 'w-4 h-4 mb-1.5'} rounded-full border border-slate-300 bg-white shadow-sm`} />
                              <span
                                className={`${ultraCompactBomb ? 'w-2.5 sm:w-3' : 'w-3 sm:w-3.5'} rounded-full transition-transform duration-200 group-hover:scale-x-110 shadow-[inset_0_1px_2px_rgba(255,255,255,0.35)]`}
                                style={{
                                  height: ultraCompactBomb
                                    ? `${42 + bomb.wires.length * 3}px`
                                    : compactBomb
                                      ? `${54 + bomb.wires.length * 4}px`
                                      : `${72 + bomb.wires.length * 6}px`,
                                  background: WIRE_COLORS[wire.color] ?? WIRE_COLORS.red,
                                }}
                              />
                            </button>
                          ))}
                        </div>

                        <div className={`relative rounded-[2rem] bg-slate-900 text-white overflow-hidden ${ultraCompactBomb ? 'px-3 py-3 min-h-[92px]' : compactBomb ? 'px-4 py-3.5 min-h-[122px]' : 'px-5 py-5 min-h-[164px]'}`}>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.18),_transparent_42%)]" />
                          <div className="relative flex items-start justify-between">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-300">
                                {t('bombDisposal.bombLabel')}
                              </p>
                              <p className={`${ultraCompactBomb ? 'text-sm' : compactBomb ? 'text-base' : 'text-lg'} font-black tracking-tight`}>{bomb.id.split('-').slice(-1)[0]}</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full ${resolved ? (bomb.status === 'disarmed' ? 'bg-emerald-400' : 'bg-red-500') : 'bg-red-400 animate-pulse'}`} />
                          </div>

                          <div className={`${ultraCompactBomb ? 'mt-2' : compactBomb ? 'mt-3' : 'mt-6'} flex items-center justify-center`}>
                            <div className={`rounded-[1.75rem] border border-white/10 bg-black/35 text-center shadow-inner ${ultraCompactBomb ? 'px-3 py-2.5 min-w-[96px]' : compactBomb ? 'px-4 py-3 min-w-[124px]' : 'px-6 py-4 min-w-[150px]'}`}>
                              <div className="text-[10px] uppercase tracking-[0.35em] text-slate-400 mb-2">
                                {t('bombDisposal.chargeState')}
                              </div>
                              <div className={`font-black font-mono tracking-[0.2em] ${ultraCompactBomb ? 'text-xl' : compactBomb ? 'text-2xl' : 'text-3xl'}`}>
                                {formatSeconds(matchState.round.timeRemainingMs)}
                              </div>
                            </div>
                          </div>

                          <AnimatePresence mode="wait">
                            {bomb.status === 'disarmed' && (
                              <motion.div
                                key="disarmed"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-emerald-500/12 backdrop-blur-[2px] flex flex-col items-center justify-center text-emerald-300"
                              >
                                <Shield className={`${ultraCompactBomb ? 'w-7 h-7 mb-1.5' : compactBomb ? 'w-9 h-9 mb-2' : 'w-12 h-12 mb-3'}`} />
                                <p className={`${ultraCompactBomb ? 'text-xl' : compactBomb ? 'text-2xl' : 'text-3xl'} font-black tracking-tight`}>{t('bombDisposal.disarmed')}</p>
                              </motion.div>
                            )}

                            {bomb.status === 'exploded' && (
                              <motion.div
                                key="exploded"
                                initial={{ opacity: 0, scale: 0.82, rotate: -2 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-red-500/18 backdrop-blur-[2px] flex flex-col items-center justify-center text-red-300"
                              >
                                <Flame className={`${ultraCompactBomb ? 'w-7 h-7 mb-1.5' : compactBomb ? 'w-9 h-9 mb-2' : 'w-12 h-12 mb-3'}`} />
                                <p className={`${ultraCompactBomb ? 'text-xl' : compactBomb ? 'text-2xl' : 'text-3xl'} font-black tracking-tight`}>{t('bombDisposal.boom')}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {matchState.roundSummary && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="absolute left-1/2 bottom-4 sm:bottom-6 z-20 -translate-x-1/2 w-[min(92%,30rem)]"
              >
                <div className="glass-card rounded-[2rem] border border-white/60 shadow-2xl px-5 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-game-accent/80 mb-1">
                        {t('bombDisposal.roundSummaryTitle')}
                      </p>
                      <h3 className="text-lg sm:text-xl font-black tracking-tight text-game-text">
                        {matchState.roundSummary.reason === 'timeout'
                          ? t('bombDisposal.timeExpired')
                          : t('bombDisposal.roundResolved')}
                      </h3>
                    </div>
                    <div className="rounded-2xl bg-slate-900 text-white px-3 py-2 min-w-[72px] text-center">
                      <div className="text-[9px] uppercase tracking-[0.25em] text-slate-400">
                        {t('bombDisposal.nextRoundIn')}
                      </div>
                      <div className="text-2xl font-black font-mono leading-none">
                        {matchState.roundSummary.countdownSeconds}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700/70">
                        {t('bombDisposal.disarmedCount')}
                      </div>
                      <div className="text-2xl font-black text-emerald-700 font-mono">
                        {matchState.roundSummary.disarmedCount}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-red-700/70">
                        {t('bombDisposal.explodedCount')}
                      </div>
                      <div className="text-2xl font-black text-red-700 font-mono">
                        {matchState.roundSummary.explodedCount}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {matchFinished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-white/94 backdrop-blur-xl flex items-center justify-center p-6 sm:p-10"
              >
                <div className="max-w-lg w-full rounded-[2.75rem] border border-game-border bg-white shadow-2xl p-8 sm:p-10 text-center">
                  <div className={`mx-auto w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 ${
                    matchState.matchStatus.state === 'player-won'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-red-100 text-red-500'
                  }`}>
                    {matchState.matchStatus.state === 'player-won' ? (
                      <Trophy className="w-10 h-10" />
                    ) : (
                      <Skull className="w-10 h-10" />
                    )}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-game-text mb-3">
                    {statusLabel}
                  </h3>
                  <p className="text-sm sm:text-base text-game-muted leading-relaxed mb-8">
                    {matchState.matchStatus.reason === 'mathematical-elimination'
                      ? t('bombDisposal.mathElimination')
                      : t('bombDisposal.targetReached')}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/70 mb-1">
                        {t('bombDisposal.playerLabel')}
                      </div>
                      <div className="text-3xl font-black text-emerald-700 font-mono">{matchState.playerScore}</div>
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-red-700/70 mb-1">
                        {t('bombDisposal.machineLabel')}
                      </div>
                      <div className="text-3xl font-black text-red-700 font-mono">{matchState.machineScore}</div>
                    </div>
                  </div>

                  <button
                    onClick={handleRestart}
                    className="premium-button w-full flex items-center justify-center gap-3 bg-game-accent hover:bg-game-accent-light text-white px-8 py-4 rounded-2xl font-black shadow-accent"
                  >
                    <RefreshCw className="w-5 h-5" />
                    {t('bombDisposal.restartMission')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
