import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Zap, Crosshair, Skull, Trophy, RefreshCw } from 'lucide-react';
import { useTacticalMemoryEngine, CardType } from '../hooks/useTacticalMemoryEngine';

const ICONS = {
  tank: Shield,
  infantry: Sword,
  artillery: Crosshair,
  air: Zap,
  special: Skull,
};

const COLORS = {
  tank: 'text-blue-400',
  infantry: 'text-green-400',
  artillery: 'text-red-400',
  air: 'text-yellow-400',
  special: 'text-purple-400',
};

export default function GridWars() {
  const { state, actions } = useTacticalMemoryEngine();
  const { cards, moves, matches, gameOver } = state;
  const { handleCardClick, initializeGame } = actions;

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 sm:gap-10 w-full mx-auto justify-center items-start pb-20">
      {/* Sidebar: Instructions */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6 sticky top-24 order-2 xl:order-1">
        <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] flex flex-col gap-6">
          <div className="flex items-center gap-3 text-game-accent">
            <div className="bg-game-accent/10 p-2 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Tactical Guide</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-game-accent/5 p-4 rounded-2xl border border-game-accent/10">
              <p className="text-[13px] text-game-text font-semibold leading-relaxed">
                Train your memory to identify and neutralize hidden tactical units.
              </p>
            </div>

            {[
              { id: 1, title: 'Reveal Unit', desc: 'Flip any card to see which tactical unit is hidden.' },
              { id: 2, title: 'Find Pairs', desc: 'Match two units of the same type to secure them.' },
              { id: 3, title: 'Intelligence', desc: 'Remember locations of non-matching units.' },
              { id: 4, title: 'Efficiency', desc: 'Clear the field in the fewest moves to earn high honors.' },
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
            <p className="text-[11px] text-game-muted italic font-medium">Focus your mind, soldier!</p>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-4xl flex flex-col gap-6 sm:gap-8 items-center order-1 xl:order-2">
        {/* Stats Panel */}
        <div className="w-full glass-card p-4 sm:p-6 rounded-[2.5rem] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">Tactical Moves</span>
              <span className="font-black text-2xl text-game-text font-mono">{moves}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">Identified Units</span>
              <span className="font-black text-2xl text-game-accent font-mono">{matches}/10</span>
            </div>
          </div>

          <button
            onClick={initializeGame}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-game-border text-game-muted active:scale-95"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>

        {/* Board */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 md:gap-5 p-4 sm:p-8 bg-white rounded-[3rem] shadow-2xl border border-game-border">
          <AnimatePresence mode="popLayout">
            {cards.map((card) => {
              const Icon = ICONS[card.type];
              const isMatched = card.isMatched;
              const isFlipped = card.isFlipped;

              return (
                <motion.button
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: !isFlipped && !isMatched ? 1.05 : 1 }}
                  whileTap={{ scale: !isFlipped && !isMatched ? 0.95 : 1 }}
                  onClick={() => handleCardClick(card.id)}
                  className={`
                    relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center
                    transition-all duration-500 perspective-1000
                    ${isFlipped || isMatched ? 'bg-white border-game-accent shadow-accent' : 'bg-slate-50 border-game-border hover:border-game-accent/30 shadow-sm'}
                    border-[3px]
                  `}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Front (Hidden) */}
                    <motion.div
                      initial={false}
                      animate={{ rotateY: isFlipped || isMatched ? 180 : 0, opacity: isFlipped || isMatched ? 0 : 1 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-game-accent/5 border-2 border-game-accent/10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-game-accent/20" />
                      </div>
                    </motion.div>

                    {/* Back (Revealed) */}
                    <motion.div
                      initial={false}
                      animate={{ rotateY: isFlipped || isMatched ? 0 : -180, opacity: isFlipped || isMatched ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className={`p-4 rounded-2xl ${isMatched ? 'bg-emerald-50' : 'bg-game-accent/5'}`}>
                        <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${isMatched ? 'text-emerald-500' : COLORS[card.type]}`} />
                      </div>
                    </motion.div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="bg-game-accent/5 p-10 rounded-[3rem] border-2 border-game-accent/10 mb-10 shadow-2xl shadow-game-accent/10">
                <div className="w-20 h-20 bg-game-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-game-accent" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic text-nowrap">Mission Complete!</h2>
                <p className="text-game-muted font-medium max-w-xs mx-auto leading-relaxed">
                  Field cleared with high efficiency in <span className="text-game-accent font-bold">{moves} tactical moves</span>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
                <button
                  onClick={initializeGame}
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
  );
}
