import { Link } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Trophy, Skull } from 'lucide-react';
import { useTurnBasedSystem } from '../hooks/useTurnBasedSystem';
import { Owner } from '../core/engine';

export default function HexConquest() {
  const GRID_SIZE = 25; // 5x5 grid
  const { turn, gameState, actions } = useTurnBasedSystem();

  // Local grid state (Domain specific)
  const [grid, setGrid] = [
    gameState.score.grid ? (gameState.score.grid as unknown as Owner[]) : Array(GRID_SIZE).fill(null),
    (newGrid: Owner[]) => actions.setGameState(prev => ({
      ...prev,
      score: { ...prev.score, grid: newGrid as any }
    }))
  ];

  const { status, winner } = gameState;
  const isPlayerTurn = turn === 'player';
  const gameOver = status === 'gameover';

  const handleCellClick = (index: number) => {
    if (grid[index] || !isPlayerTurn || gameOver) return;

    const newGrid = [...grid];
    newGrid[index] = 'player';
    setGrid(newGrid);
    actions.nextTurn();
  };

  // AI Logic
  useEffect(() => {
    if (turn === 'ai' && !gameOver && status === 'playing') {
      const timeout = setTimeout(() => {
        const availableMoves = grid.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null) as number[];

        if (availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          const newGrid = [...grid];
          newGrid[randomMove] = 'ai';
          setGrid(newGrid);
          actions.nextTurn();
        }
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [turn, gameOver, status, grid, actions]);

  // Win Condition Check
  useEffect(() => {
    if (status !== 'playing') return;

    const isFull = grid.every(cell => cell !== null);
    if (isFull) {
      const playerScore = grid.filter(c => c === 'player').length;
      const aiScore = grid.filter(c => c === 'ai').length;

      if (playerScore > aiScore) actions.endBattle('player');
      else if (aiScore > playerScore) actions.endBattle('ai');
      else actions.endBattle('draw');
    }
  }, [grid, status, actions]);

  const resetGame = useCallback(() => {
    actions.setGameState({
      status: 'playing',
      winner: null,
      score: { player: 0, ai: 0, grid: Array(GRID_SIZE).fill(null) as any }
    });
  }, [actions, GRID_SIZE]);

  // Initial Start
  useEffect(() => {
    if (status === 'idle') resetGame();
  }, [status, resetGame]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 sm:gap-10 w-full mx-auto justify-center items-start pb-20">
      {/* Sidebar: Instructions */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6 sticky top-24 order-2 xl:order-1">
        <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] flex flex-col gap-6">
          <div className="flex items-center gap-3 text-game-accent">
            <div className="bg-game-accent/10 p-2 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Strategy Guide</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-game-accent/5 p-4 rounded-2xl border border-game-accent/10">
              <p className="text-[13px] text-game-text font-semibold leading-relaxed">
                Capture as much territory as possible to outperform the opposition AI.
              </p>
            </div>

            {[
              { id: 1, title: 'Your Movement', desc: 'Secure any available gray sector to claim it for your team.' },
              { id: 2, title: 'AI Counter', desc: 'The opposition will immediately attempt to re-establish control.' },
              { id: 3, title: 'Tactics', desc: 'Plan sectors ahead to block AI expansion routes.' },
              { id: 4, title: 'Victory', desc: 'When all sectors are claimed, the majority owner wins.' },
            ].map(step => (
              <div key={step.id} className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-game-accent/10 flex items-center justify-center text-xs font-black text-game-accent shrink-0">
                  {step.id}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-game-text">{step.title}</h4>
                  <p className="text-[12px] text-game-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-game-border">
            <p className="text-[11px] text-game-muted italic font-medium">Think ahead, Commander!</p>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-2xl flex flex-col gap-6 sm:gap-8 items-center order-1 xl:order-2">
        {/* Score Panel */}
        <div className="w-full glass-card p-4 sm:p-6 rounded-[2.5rem] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">Your Sectors</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-game-accent" />
                <span className="font-black text-2xl text-game-text font-mono">{grid.filter(c => c === 'player').length}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">AI Sectors</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-black text-2xl text-game-text font-mono">{grid.filter(c => c === 'ai').length}</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            {gameOver ? (
              <div className={`px-4 py-2 rounded-xl font-black text-sm uppercase tracking-tighter ${winner === 'player' ? 'bg-emerald-50 text-emerald-600' : winner === 'ai' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                {winner === 'player' ? 'Mission Success' : winner === 'ai' ? 'Mission Failure' : 'Strategic Draw'}
              </div>
            ) : (
              <div className="text-xs font-bold text-game-muted uppercase tracking-widest animate-pulse">
                {isPlayerTurn ? 'Action Required' : 'AI Processing...'}
              </div>
            )}
          </div>

          <button
            onClick={resetGame}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-game-border text-game-muted active:scale-95"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>

        {/* Board */}
        <div className="relative p-2 sm:p-4 bg-white rounded-[3.5rem] shadow-2xl border border-game-border w-full flex items-center justify-center">
          <style>
            {`
              .hex-container {
                --hex-w: 60px;
                --hex-h: 70px;
                --hex-gap: 6px;
                --offset-x: calc((var(--hex-w) + var(--hex-gap)) / 2);
                --offset-y: calc(var(--hex-h) * -0.23);
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 2rem;
              }
              @media (min-width: 640px) {
                .hex-container {
                  --hex-w: 86px;
                  --hex-h: 100px;
                  --hex-gap: 8px;
                }
              }
              .hex-row {
                display: flex;
                gap: var(--hex-gap);
              }
              .hex-row + .hex-row {
                margin-top: var(--offset-y);
              }
              .hex-row.is-odd {
                margin-left: calc(var(--hex-w) + var(--hex-gap));
              }
              .hex-polygon {
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
              }
              .hex-shadow {
                filter: drop-shadow(0 4px 4px rgba(0,0,0,0.08)) drop-shadow(0 8px 8px rgba(0,0,0,0.04));
              }
            `}
          </style>

          <div className="bg-slate-50/50 rounded-[3rem] w-full overflow-x-auto custom-scrollbar flex justify-center">
            <div className="hex-container min-w-max">
              {Array.from({ length: 5 }).map((_, row) => (
                <div key={row} className={`hex-row ${row % 2 !== 0 ? 'is-odd' : ''}`}>
                  {Array.from({ length: 5 }).map((_, col) => {
                    const index = row * 5 + col;
                    const cell = grid[index];
                    return (
                      <div key={col} className="hex-shadow relative cursor-pointer" onClick={() => handleCellClick(index)}>
                        <motion.button
                          whileHover={{ scale: !cell && !gameOver ? 1.05 : 1, y: !cell && !gameOver ? -2 : 0 }}
                          whileTap={{ scale: !cell && !gameOver ? 0.95 : 1 }}
                          className={`
                            hex-polygon transition-all duration-500 flex items-center justify-center relative
                            ${cell === 'player' ? 'bg-indigo-600' :
                              cell === 'ai' ? 'bg-rose-500' :
                                'bg-white hover:bg-slate-50'}
                          `}
                          style={{
                            width: 'var(--hex-w)',
                            height: 'var(--hex-h)',
                            background: cell === 'player' ? 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' :
                              cell === 'ai' ? 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)' :
                                'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          {/* Inner Bevel highlighting for the hexagon feel */}
                          <div
                            className="absolute inset-[2px] opacity-50 hex-polygon pointer-events-none"
                            style={{
                              background: cell ? 'none' : 'linear-gradient(180deg, #ffffff 0%, transparent 100%)'
                            }}
                          />

                          {/* Glass Sphere for Pieces */}
                          <AnimatePresence>
                            {cell && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute z-10 rounded-full flex items-center justify-center pointer-events-none"
                                style={{
                                  width: '45%',
                                  height: '45%',
                                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.1) 60%, rgba(0,0,0,0.2) 100%)',
                                  boxShadow: `
                                    inset 0 0 10px rgba(255,255,255,0.5),
                                    0 8px 12px rgba(0,0,0,0.3),
                                    0 12px 20px rgba(0,0,0,0.2)
                                  `,
                                  backdropFilter: 'blur(4px)'
                                }}
                              >
                                {/* Core highlight of the sphere */}
                                <div className="absolute top-[15%] left-[20%] w-[30%] h-[30%] bg-white rounded-full blur-[1px] opacity-80" />
                                {/* Bottom bounce light */}
                                <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[20%] bg-white rounded-full blur-[3px] opacity-30 rotate-[-45deg]" />
                                {/* Under-sphere colored shadow cast on the hex */}
                                <div className="absolute -bottom-2 w-[80%] h-[30%] bg-black/40 rounded-full blur-[4px] -z-10" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center rounded-[3.5rem]"
              >
                <div className={`p-10 rounded-[3rem] border-2 mb-10 shadow-2xl flex flex-col items-center ${winner === 'player' ? 'bg-game-accent/5 border-game-accent/10 shadow-game-accent/10' : 'bg-red-50 border-red-100 shadow-red-500/10'}`}>
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${winner === 'player' ? 'bg-game-accent/10' : 'bg-red-100'}`}>
                    {winner === 'player' ? (
                      <Trophy className="w-10 h-10 text-game-accent" />
                    ) : (
                      <Skull className="w-10 h-10 text-red-600" />
                    )}
                  </div>
                  <h2 className={`text-4xl font-black mb-4 uppercase italic tracking-tighter ${winner === 'player' ? 'text-slate-900' : 'text-red-700'}`}>
                    {winner === 'player' ? 'Mission Success!' : winner === 'ai' ? 'Mission Failure' : 'Strategic Draw'}
                  </h2>
                  <p className="text-game-muted font-medium max-w-xs mx-auto leading-relaxed">
                    {winner === 'player' ? 'You have successfully secured the intelligence territory.' : winner === 'ai' ? 'The opposition has established regional control.' : 'High-intensity stalemate: No strategic gain Achieved.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
                  <button
                    onClick={resetGame}
                    className="premium-button flex-1 flex items-center justify-center gap-3 bg-game-accent hover:bg-game-accent-light text-white px-8 py-4 rounded-2xl font-black shadow-accent transition-all"
                  >
                    <RefreshCw className="w-5 h-5" /> New Mission
                  </button>
                  <Link
                    to="/"
                    className="premium-button flex-1 flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-game-text px-8 py-4 rounded-2xl font-black border border-game-border transition-all"
                  >
                    Abort
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
