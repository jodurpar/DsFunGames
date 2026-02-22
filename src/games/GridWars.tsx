import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Zap, Crosshair, Skull, Trophy, RefreshCw } from 'lucide-react';
import { useTacticalMemoryEngine, CardType } from '../hooks/useTacticalMemoryEngine';
import { useTranslation, Trans } from 'react-i18next';

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
  const { t } = useTranslation();
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
            <h3 className="font-extrabold text-sm uppercase tracking-wider">{t('gridWars.guideTitle')}</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-game-accent/5 p-4 rounded-2xl border border-game-accent/10">
              <p className="text-[13px] text-game-text font-semibold leading-relaxed">
                {t('gridWars.mainGoal')}
              </p>
            </div>

            {[
              { id: 1, title: t('gridWars.step1Title'), desc: t('gridWars.step1Desc') },
              { id: 2, title: t('gridWars.step2Title'), desc: t('gridWars.step2Desc') },
              { id: 3, title: t('gridWars.step3Title'), desc: t('gridWars.step3Desc') },
              { id: 4, title: t('gridWars.step4Title'), desc: t('gridWars.step4Desc') },
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
            <p className="text-[11px] text-game-muted italic font-medium">{t('gridWars.luck')}</p>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-4xl flex flex-col gap-6 sm:gap-8 items-center order-1 xl:order-2">
        {/* Stats Panel */}
        <div className="w-full glass-card p-4 sm:p-6 rounded-[2.5rem] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">{t('gridWars.moves')}</span>
              <span className="font-black text-2xl text-game-text font-mono">{moves}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-game-muted uppercase tracking-widest mb-1">{t('gridWars.units')}</span>
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
        <div className="relative p-6 sm:p-10 w-full bg-slate-100 rounded-[3rem] shadow-inner border border-slate-200/50 flex justify-center items-center overflow-hidden">
          {/* Subtle background gradient to simulate the studio light from the thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />

          <div className="relative z-10 grid grid-cols-4 sm:grid-cols-5 gap-4 md:gap-6 w-full max-w-2xl mx-auto">
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
                    whileHover={{ scale: !isFlipped && !isMatched ? 1.05 : 1, y: !isFlipped && !isMatched ? -4 : 0 }}
                    whileTap={{ scale: !isFlipped && !isMatched ? 0.95 : 1 }}
                    onClick={() => handleCardClick(card.id)}
                    className="relative aspect-square w-full rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-500 perspective-1000"
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: isFlipped || isMatched
                        ? 'inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -4px 8px rgba(99, 102, 241, 0.1), 0 8px 16px rgba(0,0,0,0.05), 0 0 20px rgba(99, 102, 241, 0.2)'
                        : 'inset 0 4px 6px rgba(255,255,255,0.9), inset 0 -4px 6px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Front (Hidden) */}
                      <motion.div
                        initial={false}
                        animate={{ rotateY: isFlipped || isMatched ? 180 : 0, opacity: isFlipped || isMatched ? 0 : 1 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-1/3 h-1/3 rounded-full border-[3px] border-slate-200/50 flex items-center justify-center opacity-30 shadow-inner">
                        </div>
                      </motion.div>

                      {/* Back (Revealed) */}
                      <motion.div
                        initial={false}
                        animate={{ rotateY: isFlipped || isMatched ? 0 : -180, opacity: isFlipped || isMatched ? 1 : 0 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div
                          className="absolute inset-0 m-auto flex items-center justify-center transition-all duration-300"
                          style={{
                            filter: isMatched ? 'drop-shadow(0 0 12px rgba(16,185,129,0.4))' : 'drop-shadow(0 4px 6px rgba(99,102,241,0.3))'
                          }}
                        >
                          <Icon
                            className={`w-1/2 h-1/2 ${isMatched ? 'text-emerald-500' : typeof COLORS[card.type] === 'string' ? COLORS[card.type] : 'text-indigo-500'}`}
                            style={{
                              strokeWidth: 2.5,
                              color: isMatched ? '#10b981' : '#4f46e5'
                            }}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Game Over Overlay moved inside the board container */}
          <AnimatePresence>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center rounded-[3rem]"
              >
                <div className="bg-game-accent/5 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 border-game-accent/10 mb-6 sm:mb-10 shadow-2xl shadow-game-accent/10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-game-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-game-accent" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2 sm:mb-4 tracking-tighter uppercase italic text-nowrap">{t('gridWars.complete')}</h2>
                  <div className="text-game-muted font-medium max-w-xs mx-auto text-xs sm:text-sm leading-relaxed">
                    <Trans i18nKey="gridWars.completeDesc" values={{ count: moves }}>
                      Field cleared with high efficiency in <span className="text-game-accent font-bold">{moves} tactical moves</span>.
                    </Trans>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm px-4">
                  <button
                    onClick={initializeGame}
                    className="premium-button flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-game-accent hover:bg-game-accent-light text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-accent transition-all text-xs sm:text-sm"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" /> {t('gridWars.newMission')}
                  </button>
                  <Link
                    to="/"
                    className="premium-button flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-slate-50 hover:bg-slate-100 text-game-text px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black border border-game-border transition-all text-xs sm:text-sm"
                  >
                    {t('gridWars.abort')}
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
