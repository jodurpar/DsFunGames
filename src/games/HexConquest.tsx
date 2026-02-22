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
        <div className="relative p-1 bg-white rounded-[3.5rem] shadow-2xl border border-game-border">
          <div className="grid grid-cols-5 gap-3 sm:gap-4 bg-slate-50/50 p-6 sm:p-10 rounded-[3rem]">
            {grid.map((cell, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: !cell && !gameOver ? 1.05 : 1 }}
                whileTap={{ scale: !cell && !gameOver ? 0.95 : 1 }}
                onClick={() => handleCellClick(index)}
                className={`
                  w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl transition-all duration-500 flex items-center justify-center
                  border-[3px]
                  ${cell === 'player' ? 'bg-game-accent border-white shadow-xl shadow-game-accent/20' :
                    cell === 'ai' ? 'bg-red-500 border-white shadow-xl shadow-red-500/20' :
                      'bg-white border-game-border hover:border-game-accent/30 shadow-sm'}
                `}
              >
                {cell === 'player' && <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white/40 rounded-full animate-pulse" />}
                {cell === 'ai' && <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white/40 rounded-full" />}
              </motion.button>
            ))}
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
